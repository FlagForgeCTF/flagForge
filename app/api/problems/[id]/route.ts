import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import QuestionModel from "@/models/qustionsSchema";
import { HttpStatusCode } from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import userSchema from "@/models/userSchema";
import UserQuestionModel from "@/models/userQuestionSchema";
import mongoose from "mongoose";
import UserHintModel from "@/models/userHintSchema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


// Helper functions to reduce duplication
async function findQuestionById(id: string) {
  const question = mongoose.isValidObjectId(id)
    ? await QuestionModel.findById(id)
    : null;
  if (!question) {
    return {
      error: NextResponse.json(
        { message: `Question ${id} not found` },
        { status: HttpStatusCode.NotFound }
      ),
    };
  }
  return { question };
}

async function findUserByEmail(email: string) {
  const user = await userSchema.findOne({ email });
  if (!user) {
    return {
      error: NextResponse.json(
        { message: "User not found" },
        { status: HttpStatusCode.NotFound }
      ),
    };
  }
  return { user };
}

function checkQuestionExpiry(question: any) {
  const now = new Date();
  let expired = false;
  let timeRemaining = null;

  if (question.expiryDate) {
    const expiryDate = new Date(question.expiryDate);
    expired = expiryDate < now;
    timeRemaining = Math.max(0, expiryDate.getTime() - now.getTime());
  }

  return { expired, timeRemaining };
}

async function getUserHints(userId: string, questionId: string) {
  const userHint = await UserHintModel.findOne({
    userId,
    questionId,
  });
  return userHint ? userHint.usedHints : [];
}

async function checkExistingSolution(userId: string, questionId: string) {
  return await UserQuestionModel.findOne({
    userId,
    questionId,
  });
}

function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const { question, error: questionError } = await findQuestionById(id);
    if (questionError) return questionError;

    const { expired, timeRemaining } = checkQuestionExpiry(question);

    if (expired) {
      return NextResponse.json(
        {
          message: "This time-limited challenge has expired",
          expired: true,
        },
        { status: 410 }
      );
    }

    const hints = Array.isArray(question.hints) ? question.hints : [];
    const hintCount = hints.filter((hint: any) => {
      return hint?.text && String(hint.text).trim() !== "";
    }).length;

    const questionData = question.toObject();
    delete questionData.flag;
    delete questionData.hints; // Remove hints from main data

    // Only fetch user-specific data if session exists
    let isDone = false;
    let usedHints: number[] = [];
    
    if (session?.user?.email) {
      const user = await userSchema.findOne({ email: session.user.email });
      if (user) {
        const userQuestion = await UserQuestionModel.findOne({
          userId: user.id,
          questionId: id,
        });
        isDone = !!userQuestion;
        usedHints = await getUserHints(user._id, id);
      }
    }

    const solveCount = await UserQuestionModel.countDocuments({ questionId: id });

    return NextResponse.json({
      question: questionData,
      hintCount,
      isDone,
      expired,
      timeRemaining,
      expiryDate: question.expiryDate,
      usedHints: usedHints,
      solveCount,
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return createErrorResponse(
      "Internal server error",
      HttpStatusCode.InternalServerError
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse("Unauthorized", HttpStatusCode.Unauthorized);
    }

    // Get the submitted flag from request body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse("Invalid request body", HttpStatusCode.BadRequest);
    }
    const { flag: submittedFlag } = body ?? {};
    const isPractice = request.nextUrl.searchParams.get("practice") === "true";

    if (!submittedFlag || typeof submittedFlag !== "string") {
      return createErrorResponse("Flag is required", HttpStatusCode.BadRequest);
    }

    // Find the question
    const { question, error: questionError } = await findQuestionById(id);
    if (questionError) return questionError;

    // Check if question has expired
    const { expired } = checkQuestionExpiry(question);
    if (expired) {
      return createErrorResponse(
        "This challenge has expired",
        HttpStatusCode.Gone
      );
    }

    // Find the user
    const { user, error: userError } = await findUserByEmail(
      session.user.email
    );
    if (userError) return userError;

    const trimmedSubmittedFlag = submittedFlag.trim();
    const correctFlag = question.flag.trim();

    // Check if user has already solved this question
    const existingSolution = await checkExistingSolution(user._id, id);
    if (existingSolution && isPractice) {
      const isCorrect = trimmedSubmittedFlag === correctFlag;
      return NextResponse.json(
        {
          message: isCorrect
            ? "Practice mode: Correct flag."
            : "Practice mode: Incorrect flag. Try again!",
          correct: isCorrect,
          practice: true,
        },
        { status: HttpStatusCode.Ok }
      );
    }
    if (existingSolution) {
      return NextResponse.json(
        { message: "You have already solved this challenge!" },
        { status: HttpStatusCode.Ok }
      );
    }

    // Check if the submitted flag is correct
    if (trimmedSubmittedFlag === correctFlag) {
      // Flag is correct - save the solution
      try {
        // Calculate final points considering hint penalties
        const finalPoints = Number(question.points) || 0;

        // Get used hints to calculate penalty
        const usedHints = await getUserHints(user._id, id);
        if (usedHints.length > 0) {
          let totalPenalty = 0;
          const hints = question.hints || [];

          usedHints.forEach((hintIndex: number) => {
            if (hintIndex < hints.length && hints[hintIndex].pointsDeduction) {
              totalPenalty += Number(hints[hintIndex].pointsDeduction) || 0;
            }
          });
          console.log(
            `User ${user._id} solved with ${totalPenalty} points already deducted from hints`
          );
        }

        const newSolution = new UserQuestionModel({
          userId: user._id,
          questionId: id,
          solvedAt: new Date(),
          pointsEarned: finalPoints,
        });

        try {
          await newSolution.save();
        } catch (dupError: any) {
          // Unique index on (userId, questionId): a parallel request already recorded this solve
          if (dupError?.code === 11000) {
            return NextResponse.json(
              { message: "You have already solved this challenge!" },
              { status: HttpStatusCode.Ok }
            );
          }
          throw dupError;
        }

        const updateResult = await userSchema.findByIdAndUpdate(
          user._id,
          { $inc: { totalScore: finalPoints } },
          {
            new: true,
            upsert: false,
          }
        );

        if (!updateResult) {
          console.error("Failed to update user score");
        } else {
          console.log(
            `User score updated. Added: ${finalPoints}, New total: ${updateResult.totalScore}`
          );
        }

        return NextResponse.json(
          {
            message: "Right! Congratulations on solving the challenge!",
            points: finalPoints,
            success: true,
            correct: true,
          },
          { status: HttpStatusCode.Ok }
        );
      } catch (saveError) {
        console.error("Error saving solution:", saveError);
        return createErrorResponse(
          "Error saving your solution. Please try again.",
          HttpStatusCode.InternalServerError
        );
      }
    } else {
      // Flag is incorrect
      return NextResponse.json(
        {
          message: "Incorrect flag. Try again!",
          success: false,
          correct: false,
        },
        { status: HttpStatusCode.Ok }
      );
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return createErrorResponse(
      "Internal server error",
      HttpStatusCode.InternalServerError
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const user = await userSchema.findOne({ email: session?.user?.email });
    if (!user || user.role !== "Admin") {
      return createErrorResponse("Unauthorized", HttpStatusCode.Unauthorized);
    }

    const { question, error } = await findQuestionById(id);
    if (error) return error;

    await QuestionModel.findByIdAndDelete(id);
    
    // Also delete associated UserQuestions and UserHints
    await UserQuestionModel.deleteMany({ questionId: id });
    await UserHintModel.deleteMany({ questionId: id });

    return NextResponse.json(
      { message: "Challenge deleted successfully" },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Error deleting challenge:", error);
    return createErrorResponse("Internal server error", HttpStatusCode.InternalServerError);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const user = await userSchema.findOne({ email: session?.user?.email });
    if (!user || user.role !== "Admin") {
      return createErrorResponse("Unauthorized", HttpStatusCode.Unauthorized);
    }

    const updateData = await request.json();

    const { question, error } = await findQuestionById(id);
    if (error) return error;

    const updatedQuestion = await QuestionModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: "Challenge updated successfully", question: updatedQuestion },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Error updating challenge:", error);
    return createErrorResponse("Internal server error", HttpStatusCode.InternalServerError);
  }
}
