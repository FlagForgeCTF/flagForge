import { NextResponse } from "next/server";
import connect from "@/utils/db";
import Problems from "@/models/qustionsSchema";
import userSchema from "@/models/userSchema";
import UserQuestionModel from "@/models/userQuestionSchema";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import UserHintModel from "@/models/userHintSchema";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_KEY_HERE";

// Schema for chat hint tracking
const chatHintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  hintRequests: [
    {
      timestamp: { type: Date, default: Date.now },
      message: String,
      hintLevel: String,
      pointsDeducted: { type: Number, default: 0 },
    },
  ],
  totalPointsDeducted: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

chatHintSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const ChatHintModel =
  mongoose.models.ChatHint || mongoose.model("ChatHint", chatHintSchema);

// Helper function to determine if message is asking for a hint
function isHintRequest(message: string): boolean {
  const hintKeywords = [
    "hint",
    "help",
    "stuck",
    "clue",
    "guide",
    "tip",
    "how do i",
    "how to",
    "what should",
    "where do i",
    "can you help",
    "need help",
    "show me",
    "tell me how",
  ];

  const lowerMessage = message.toLowerCase();
  return hintKeywords.some((keyword) => lowerMessage.includes(keyword));
}

// Calculate progressive penalty based on number of chat hints used
function calculateChatHintPenalty(previousHints: number): number {
  // Fixed penalty: 0.5 points for each hint
  return 0.5;
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ reply: "Invalid request." }, { status: 400 });
    }
    const { message, challengeId } = body ?? {};
    const hintLevel =
      typeof body?.hintLevel === "string" ? body.hintLevel.slice(0, 20) : "chat";

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 2000 ||
      !mongoose.isValidObjectId(challengeId)
    ) {
      return NextResponse.json({ reply: "Invalid request." }, { status: 400 });
    }

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { reply: "You must be logged in to use the chat assistant." },
        { status: 401 },
      );
    }

    await connect();

    // Find the question
    const question = await Problems.findById(challengeId);
    if (!question) {
      return NextResponse.json(
        { reply: "Challenge not found." },
        { status: 404 },
      );
    }

    // Find the user
    const user = await userSchema.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ reply: "User not found." }, { status: 404 });
    }

    // Check if user has already solved this question
    const existingSolution = await UserQuestionModel.findOne({
      userId: user._id,
      questionId: { $eq: challengeId },
    });

    if (existingSolution) {
      return NextResponse.json({
        reply:
          "You've already solved this challenge! Feel free to ask questions for learning purposes, but no points will be deducted.",
        pointsDeducted: 0,
        alreadySolved: true,
      });
    }

    // Get or create chat hint tracking
    let chatHint = await ChatHintModel.findOne({
      userId: user._id,
      questionId: challengeId,
    });

    if (!chatHint) {
      chatHint = new ChatHintModel({
        userId: user._id,
        questionId: challengeId,
        hintRequests: [],
        totalPointsDeducted: 0,
      });
    }

    // Determine if this is a hint request
    const isRequestingHint = isHintRequest(message);
    let pointsToDeduct = 0;
    let warningMessage = "";

    if (isRequestingHint) {
      // Calculate penalty
      pointsToDeduct = calculateChatHintPenalty(chatHint.hintRequests.length);
      warningMessage = `\n\n⚠️ **Chat Hint Used**: ${pointsToDeduct} points have been deducted from your score. You've used ${chatHint.hintRequests.length + 1} chat hint(s) for this challenge.`;
    }

    // Only give the assistant hints the user has already unlocked (and paid
    // for); otherwise locked hint text can be extracted from the prompt for free
    const userHint = await UserHintModel.findOne({
      userId: user._id,
      questionId: question._id,
    });
    const unlockedIndices: number[] = userHint?.usedHints ?? [];
    const hints =
      (question.hints || [])
        .map((h: any, i: number) => ({ text: h?.text, i }))
        .filter((h: any) => h.text && unlockedIndices.includes(h.i))
        .map((h: any) => `Hint ${h.i + 1}: ${h.text}`)
        .join("\n") || "None unlocked yet.";

    // Construct context
    const systemPrompt = `
You are FlagForge's CTF assistant, your name is Hintsye. 
Help the user understand and solve the challenge but never reveal the flag directly. 
Provide progressive guidance based on hints.

Challenge: ${question.title}
Description: ${question.description}
Category: ${question.category}
Difficulty: ${question.difficulty || "Not specified"}
Points: ${question.points || 0}
Hints:\n${hints}
User's requested hint level: ${hintLevel}

IMPORTANT GUIDELINES:
- Never reveal the flag at any cost. The flag format is always FLAG{...}Forge or flag{...}forge
- Provide progressive hints that guide thinking without giving away the solution
- Encourage learning and problem-solving skills
- If asked directly for the flag, refuse politely and encourage independent solving
- Be concise but helpful
- Ask clarifying questions when the user's request is vague
- If this is their ${chatHint.hintRequests.length + 1}th chat hint request, provide slightly more detailed guidance

Respond in a helpful, encouraging tone.
`;

    const llmResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
        }),
      },
    );

    const data = await llmResponse.json();
    let reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a hint.";

    // If this was a hint request, deduct points and update tracking
    if (isRequestingHint) {
      // Add hint request to tracking
      chatHint.hintRequests.push({
        timestamp: new Date(),
        message: message,
        hintLevel,
        pointsDeducted: pointsToDeduct,
      });
      chatHint.totalPointsDeducted += pointsToDeduct;
      chatHint.updatedAt = new Date();
      await chatHint.save();

      // Atomically deduct points, ensuring the score doesn't go below 0
      await userSchema.findByIdAndUpdate(user._id, [
        {
          $set: {
            totalScore: {
              $max: [0, { $subtract: [{ $ifNull: ["$totalScore", 0] }, pointsToDeduct] }],
            },
          },
        },
      ]);

      // Add warning to reply
      reply += warningMessage;
    }

    return NextResponse.json({
      reply,
      pointsDeducted: pointsToDeduct,
      totalChatHintsUsed: chatHint.hintRequests.length,
      totalPointsDeducted: chatHint.totalPointsDeducted,
      isHintRequest: isRequestingHint,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { reply: "Error processing your request." },
      { status: 500 },
    );
  }
}
