import { NextResponse } from "next/server";
import connect from "@/utils/db";
import QuestionModel from "@/models/qustionsSchema";
import { requireAdmin } from "@/lib/requireAdmin";
import { syncChallengeScores } from "@/lib/dynamicScoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST - Re-value every challenge's solves under dynamic scoring (idempotent; run once after deploy).
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    await connect();
    const questions = await QuestionModel.find({}).select("_id points").lean<{ _id: unknown; points: number }[]>();
    for (const question of questions) {
      await syncChallengeScores(question);
    }
    return NextResponse.json({ success: true, challenges: questions.length });
  } catch (error) {
    console.error("Error recalculating scores:", error);
    return NextResponse.json({ success: false, error: "Failed to recalculate scores" }, { status: 500 });
  }
}
