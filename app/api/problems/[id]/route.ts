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
import { redis } from "@/lib/tokenBlacklist";
import { challengeValue, syncChallengeScores } from "@/lib/dynamicScoring";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FLAG_ATTEMPTS_PER_WINDOW = 10;
const FLAG_WINDOW_SECONDS = 60;

// Fixed-window counter per user per challenge; returns false once the limit is exceeded.
async function allowFlagAttempt(userId: string, questionId: string) {
  const key = `flagrl:${userId}:${questionId}`;
  try {
    const attempts = await redis.incr(key);
    if (attempts === 1) await redis.expire(key, FLAG_WINDOW_SECONDS);
    if (attempts > FLAG_ATTEMPTS_PER_WINDOW) {
      console.warn(`Flag rate limit hit: user=${userId} question=${questionId} attempts=${attempts}`);
      return false;
    }
    return true;
  } catch (error) {
    // Fail open so a Redis outage doesn't block all solving (same policy as the token blacklist).
    console.error("Flag rate limiter unavailable:", error);
    return true;
  }
}


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
    questionData.points = challengeValue(question.points, solveCount);

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

    if (!(await allowFlagAttempt(String(user._id), id))) {
      return NextResponse.json(
        { message: `Too many attempts. Wait ${FLAG_WINDOW_SECONDS} seconds and try again.` },
        { status: HttpStatusCode.TooManyRequests, headers: { "Retry-After": String(FLAG_WINDOW_SECONDS) } }
      );
    }

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
        // Hint penalties were already deducted from totalScore when each hint was revealed.
        // Start at 0 credited points; syncChallengeScores credits this solve and re-values earlier ones.
        const newSolution = new UserQuestionModel({
          userId: user._id,
          questionId: id,
          awarded: 0,
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

        await syncChallengeScores(question);
        const credited = await UserQuestionModel.findById(newSolution._id).select("awarded").lean<{ awarded?: number }>();
        const finalPoints = credited?.awarded ?? 0;

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

    if (updatedQuestion && updateData.points !== undefined) {
      await syncChallengeScores(updatedQuestion);
    }

    return NextResponse.json(
      { message: "Challenge updated successfully", question: updatedQuestion },
      { status: HttpStatusCode.Ok }
    );
  } catch (error) {
    console.error("Error updating challenge:", error);
    return createErrorResponse("Internal server error", HttpStatusCode.InternalServerError);
  }
}
