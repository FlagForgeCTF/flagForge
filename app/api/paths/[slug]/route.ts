import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import PathModel from "@/models/pathSchema";
import QuestionModel from "@/models/qustionsSchema";
import UserQuestionModel from "@/models/userQuestionSchema";
import { requireAdmin } from "@/lib/requireAdmin";
import { getSolvedIds, parsePathInput, slugify } from "@/lib/paths";
import { challengeValue } from "@/lib/dynamicScoring";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

// GET /api/paths/[slug] - ordered steps with solved/locked state for the caller
export async function GET(_: NextRequest, { params }: Params) {
  try {
    await connect();
    const { slug } = await params;
    const path = await PathModel.findOne({ slug: { $eq: slug } }).lean<any>();
    if (!path) return NextResponse.json({ success: false, message: "Path not found" }, { status: 404 });

    const [questions, solveCounts, solved] = await Promise.all([
      QuestionModel.find({ _id: { $in: path.challenges } }).select("title category points").lean<any[]>(),
      UserQuestionModel.aggregate([
        { $match: { questionId: { $in: path.challenges } } },
        { $group: { _id: "$questionId", count: { $sum: 1 } } },
      ]),
      getSolvedIds(),
    ]);
    const byId = new Map(questions.map((q) => [String(q._id), q]));
    const countById = new Map(solveCounts.map((c) => [String(c._id), c.count as number]));

    // Steps for deleted challenges are dropped; everything after the first unsolved step is locked.
    let unlocked = true;
    const steps = path.challenges
      .map((id: unknown) => byId.get(String(id)))
      .filter(Boolean)
      .map((q: any) => {
        const isSolved = solved.has(String(q._id));
        const step = {
          _id: q._id,
          title: q.title,
          category: q.category,
          points: challengeValue(q.points, countById.get(String(q._id)) ?? 0),
          solved: isSolved,
          locked: !unlocked,
        };
        if (!isSolved) unlocked = false;
        return step;
      });

    return NextResponse.json({
      success: true,
      path: {
        _id: path._id,
        title: path.title,
        slug: path.slug,
        description: path.description,
        difficulty: path.difficulty,
        challenges: path.challenges,
        steps,
      },
    });
  } catch (error) {
    console.error("Error fetching path:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch path" }, { status: 500 });
  }
}

// PUT /api/paths/[slug] - admin edits a path (slug follows the title)
export async function PUT(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    await connect();
    const { slug } = await params;
    const parsed = await parsePathInput(await req.json().catch(() => null));
    if (parsed.error) return NextResponse.json({ success: false, message: parsed.error }, { status: 400 });

    const path = await PathModel.findOneAndUpdate(
      { slug: { $eq: slug } },
      { $set: { ...parsed.data, slug: slugify(parsed.data!.title) } },
      { new: true, runValidators: true }
    );
    if (!path) return NextResponse.json({ success: false, message: "Path not found" }, { status: 404 });
    return NextResponse.json({ success: true, path });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, message: "A path with this title already exists" }, { status: 409 });
    }
    console.error("Error updating path:", error);
    return NextResponse.json({ success: false, message: "Failed to update path" }, { status: 500 });
  }
}

// DELETE /api/paths/[slug] - admin deletes a path (challenges and solves are untouched)
export async function DELETE(_: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    await connect();
    const { slug } = await params;
    const result = await PathModel.deleteOne({ slug: { $eq: slug } });
    if (result.deletedCount === 0) return NextResponse.json({ success: false, message: "Path not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting path:", error);
    return NextResponse.json({ success: false, message: "Failed to delete path" }, { status: 500 });
  }
}
