// app/api/forgeacademy/route.ts
import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import Question from "@/models/qustionsSchema"; // Use the correct model
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
  try {
    // Requires login: this calls a paid LLM API
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, difficulty } = await req.json();
    if (typeof topic !== "string" || !topic.trim() || topic.length > 200) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    // Connect to MongoDB
    await connect();

    // Fetch candidate challenges from 'question' collection
    const regex = new RegExp(topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const candidates = await Question.find({
      $or: [
        { title: regex },
        { category: regex },
        { description: regex },
        { tags: regex },
      ],
    })
      .select("title category description")
      .limit(20)
      .lean();

    // Build AI prompt
    const systemMessage = `
You are ForgeAcademy AI — an expert cybersecurity instructor at FlagForge.
Create high-quality, TryHackMe-style lessons formatted exactly as JSON:
{
  "title","id","level","estimated_time_minutes","tags","overview",
  "learning_objectives","sections[]","mini_lab","quiz[]","references","common_pitfalls"
}
Sections should include Introduction, Concepts, Practical Lab, Challenge, Summary.
Do NOT include any flags in plaintext. If a lab requires a flag, set flag.type="hidden".
Return only valid JSON.
`;

    const userMessage = `Generate a detailed lesson on "${topic}" for ${
      difficulty || "Beginner"
    } learners.
Constraints:
- At least 3 sections with at least one code example
- One mini_lab (dockerfile + instructions) running on port 8080
- 3 multiple-choice quiz questions with explanations
- 2-4 authoritative references
- Short 'common_pitfalls' array (3 items)
Candidates: ${JSON.stringify(
      candidates.map((c) => ({
        id: c._id?.toString(),
        title: c.title,
        category: c.category,
        description: c.description,
      }))
    )}
Select the most relevant challenge and return only JSON with fields: id, title, slug (or id).
Return only JSON.
`;

    // Call OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage },
          ],
          temperature: 0.1,
          max_tokens: 1500,
        }),
      }
    );

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content?.trim();
    if (!aiText) {
      return NextResponse.json(
        { error: "AI returned no content" },
        { status: 500 }
      );
    }

    // Parse AI JSON safely
    let lesson: any = null;
    try {
      lesson = JSON.parse(aiText);
    } catch {
      const maybeJson = aiText.match(/\{[\s\S]*\}$/);
      lesson = maybeJson ? JSON.parse(maybeJson[0]) : { raw: aiText };
    }

    // Pick the best challenge returned by AI, fallback to first candidate
    if (!lesson || typeof lesson !== "object") lesson = { raw: aiText };
    const bestChallenge =
      lesson?.id || lesson?.challenge_id ? lesson : candidates[0] || null;

    if (bestChallenge) {
      const challengeId = bestChallenge.id || bestChallenge._id?.toString();
      const challengeTitle = bestChallenge.title || "Untitled Challenge";
      const challengeLink = `https://flagforgectf.com/problems/${challengeId}`;

      // Inject challenge link into lesson
      lesson.challenge_meta = {
        challenge_id: challengeId,
        challenge_title: challengeTitle,
        challenge_slug: challengeId,
        challenge_link: challengeLink,
      };

      lesson.sections = Array.isArray(lesson.sections) ? lesson.sections : [];
      const idx = lesson.sections.findIndex((s: any) =>
        /challenge/i.test(s.title || "")
      );
      const linkText = `Related existing FlagForge challenge: ${challengeTitle} — ${challengeLink}`;
      if (idx >= 0) {
        lesson.sections[idx].content += "\n\n" + linkText;
      } else {
        lesson.sections.push({ title: "Related Challenge", content: linkText });
      }

      if (!lesson.mini_lab) lesson.mini_lab = {};
      lesson.mini_lab.related_challenge = {
        id: challengeId,
        title: challengeTitle,
        url: challengeLink,
      };
    }

    return NextResponse.json({ success: true, data: lesson });
  } catch (err) {
    console.error("ForgeAcademy error:", err);
    return NextResponse.json(
      { error: "Lesson generation failed" },
      { status: 500 }
    );
  }
}
