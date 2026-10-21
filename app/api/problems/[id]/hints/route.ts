import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import QuestionModel from "@/models/qustionsSchema";
import { HttpStatusCode } from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import userSchema from "@/models/userSchema";
import UserQuestionModel from "@/models/userQuestionSchema";
import UserHintModel from "@/models/userHintSchema";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


// GET - Fetch available hints for a question
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const question = mongoose.isValidObjectId(id)
      ? await QuestionModel.findById(id)
      : null;

    if (!question) {
      return NextResponse.json(
        { message: `Question ${id} not found` },
        { status: HttpStatusCode.NotFound }
      );
    }

    // Check if question has expired
    if (question.expiryDate) {
      const now = new Date();
      const expiryDate = new Date(question.expiryDate);
      if (expiryDate < now) {
        return NextResponse.json(
          { message: "This challenge has expired" },
          { status: HttpStatusCode.Gone }
        );
      }
    }

    const user = await userSchema.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    // Get used hints for this user and question
    const userHint = await UserHintModel.findOne({
      userId: user._id,
      questionId: id,
    });

    const usedHints = userHint ? userHint.usedHints : [];
    const hints = question.hints || [];

    //only hints text for unlocked hints
    //only hints text for unlocked hints
    const safeHints = hints
      .map((hint: any, idx: number) => {
        if (!hint.text || hint.text.trim() === "") {
          return null;
        }
        if (usedHints.includes(idx)) {
          return {
            index: idx,
            text: hint.text,
            pointsDeduction: hint.pointsDeduction || 0,
          };
        } else {
          return {
            index: idx,
            text: null, // Hide text for locked hints
            pointsDeduction: hint.pointsDeduction || 0,
          };
        }
      })
      .filter((hint: any) => hint !== null);

    return NextResponse.json({
      hints: safeHints,
      usedHints: usedHints,
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching hints:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

// POST - Request a specific hint
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: HttpStatusCode.BadRequest }
      );
    }
    const { hintIndex } = body ?? {};

    if (!Number.isInteger(hintIndex) || hintIndex < 0) {
      return NextResponse.json(
        { message: "Invalid hint index" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const question = mongoose.isValidObjectId(id)
      ? await QuestionModel.findById(id)
      : null;

    if (!question) {
      return NextResponse.json(
        { message: `Question ${id} not found` },
        { status: HttpStatusCode.NotFound }
      );
    }

    // Check if question has expired
    if (question.expiryDate) {
      const now = new Date();
      const expiryDate = new Date(question.expiryDate);
      if (expiryDate < now) {
        return NextResponse.json(
          { message: "This challenge has expired" },
          { status: HttpStatusCode.Gone }
        );
      }
    }

    const user = await userSchema.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    // Check if user has already solved this question
    const existingSolution = await UserQuestionModel.findOne({
      userId: user._id,
      questionId: id,
    });

    if (existingSolution) {
      return NextResponse.json(
        {
          message:
            "You have already solved this challenge! Hints are not needed.",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const hints = question.hints || [];

    if (hintIndex >= hints.length) {
      return NextResponse.json(
        { message: "Hint not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    const requestedHint = hints[hintIndex];

    // Atomically mark the hint as used. The filter only matches when the index
    // isn't already present, so concurrent requests can't unlock (and charge) twice.
    let unlocked = false;
    try {
      const result = await UserHintModel.updateOne(
        { userId: user._id, questionId: id, usedHints: { $ne: hintIndex } },
        {
          $addToSet: { usedHints: hintIndex },
          $set: { updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
      unlocked = result.modifiedCount > 0 || result.upsertedCount > 0;
    } catch (err: any) {
      // Upsert collided with the existing (userId, questionId) doc that already
      // contains this index
      if (err?.code !== 11000) throw err;
    }

    if (!unlocked) {
      return NextResponse.json(
        { message: "You have already used this hint" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    let message = `Hint revealed: ${requestedHint.text}`;
    let pointsDeducted = 0;

    // Deduct points if specified
    if (
      requestedHint.pointsDeduction &&
      Number(requestedHint.pointsDeduction) > 0
    ) {
      pointsDeducted = Number(requestedHint.pointsDeduction);

      // Atomically deduct, ensuring the score doesn't go below 0 and without
      // clobbering concurrent score changes
      const updateResult = await userSchema.findByIdAndUpdate(
        user._id,
        [
          {
            $set: {
              totalScore: {
                $max: [0, { $subtract: [{ $ifNull: ["$totalScore", 0] }, pointsDeducted] }],
              },
            },
          },
        ],
        { new: true }
      );

      if (updateResult) {
        message = `Hint revealed: ${requestedHint.text}. ${pointsDeducted} points deducted from your score.`;
      } else {
        console.error("Failed to update user score for hint penalty");
      }
    }

    return NextResponse.json({
      message: message,
      hint: requestedHint.text,
      pointsDeducted: pointsDeducted,
      success: true,
    });
  } catch (error) {
    console.error("Error requesting hint:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
