import connect from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import QuestionModel from "@/models/qustionsSchema";
import { HttpStatusCode } from "axios";
import userSchema from "@/models/userSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import UserQuestionModel from "@/models/userQuestionSchema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: HttpStatusCode.Unauthorized }
    );
  }

  try {
    await connect();

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 8; // Fixed to 8 items per page
    const skip = (page - 1) * limit;

    // Find the user
    const user = await userSchema.findOne({ email: session?.user?.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    // Get total count of completed questions for pagination info
    const totalCompletedCount = await UserQuestionModel.countDocuments({
      userId: user._id,
    });

    // Get paginated completed questions by this user, sorted by completion date (newest first)
    const completedUserQuestions = await UserQuestionModel.find({
      userId: user._id,
    })
      .sort({ createdAt: -1 }) // Sort by completion date, newest first
      .skip(skip)
      .limit(limit)
      .populate({
        path: "questionId",
        select: "-flag", // Exclude the flag field for security
        model: QuestionModel,
      });

    // Extract the populated question data and add completion info
    const completedProblems = completedUserQuestions
      .filter((userQuestion) => userQuestion.questionId) // Filter out any null/undefined
      .map((userQuestion) => ({
        ...userQuestion.questionId.toObject(),
        completedAt: userQuestion.createdAt, // When they completed it
        pointsEarned: userQuestion.awarded ?? userQuestion.questionId.points, // Points currently credited
      }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCompletedCount / limit);
    const hasMore = page < totalPages;
    const hasPrevious = page > 1;

    return NextResponse.json({
      success: true,
      completedProblems,
      totalProblems: totalCompletedCount,
      currentPage: page,
      totalPages,
      hasMore,
      hasPrevious,
      itemsPerPage: limit,
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Error fetching completed problems:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch completed problems" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
