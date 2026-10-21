import { NextResponse } from "next/server";
import UserSchema from "@/models/userSchema";
import UserQuestionModel from "@/models/userQuestionSchema";
import connect from "@/utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getSolveStats } from "@/lib/solveStats";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/profile
export async function GET(req: Request) {
  try {
    await connect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data
    const user = await UserSchema.findOne({ email: session.user?.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // DEBUG: Get ALL user questions to see the structure
    const allUserQuestions = await UserQuestionModel.find({ userId: user._id });

    // DEBUG: Try different possible field names for completion
    const possibleCompletionFields = [
      "isCompleted",
      "isSolved",
      "solved",
      "completed",
      "status",
      "isCorrect",
      "success",
    ];

    // Check what fields exist in the records
    if (allUserQuestions.length > 0) {
      console.log(
        "Available fields in UserQuestionModel:",
        Object.keys(allUserQuestions[0].toObject())
      );
    }

    // For now, let's use the original count while we debug
    const completedQuestions = allUserQuestions.length;

    // DEBUG: Try some possible queries to see which works
    const testQueries = [];
    for (const field of possibleCompletionFields) {
      try {
        const count = await UserQuestionModel.countDocuments({
          userId: user._id,
          [field]: true,
        });
        if (count > 0) {
          testQueries.push({ field, count });
        }
      } catch (e) {
        // Field doesn't exist, continue
      }
    }
    console.log("Test queries with results:", testQueries);

    // Try status-based queries
    const statusTests = ["completed", "solved", "correct", "success"];
    for (const status of statusTests) {
      try {
        const count = await UserQuestionModel.countDocuments({
          userId: user._id,
          status: status,
        });
        if (count > 0) {
          testQueries.push({ field: "status", value: status, count });
        }
      } catch (e) {
        // Continue
      }
    }

    // Get all users to calculate rank
    const allUsers = await UserSchema.find({})
      .sort({ totalScore: -1 })
      .select("_id totalScore");
    const userRank =
      allUsers.findIndex((u) => u._id.toString() === user._id.toString()) + 1;

    // Calculate level based on score
    const getLevel = (score: number): string => {
      if (score < 200) return "[0x1][Newbie]";
      if (score < 500) return "[0x2][Scout]";
      if (score < 1000) return "[0x3][Codebreaker]";
      if (score < 1500) return "[0x4][Hacker]";
      if (score < 2000) return "[0x5][Cipher Hunter]";
      if (score < 3000) return "[0x6][Forger]";
      return "[0x7][Flag Conqueror]";
    };

    // Calculate badges (achievements based on completed questions)
    const getBadges = (completed: number): number => {
      let badges = 0;
      if (completed >= 1) badges++; // First solution badge
      if (completed >= 5) badges++; // 5 solutions badge
      if (completed >= 10) badges++; // 10 solutions badge
      if (completed >= 25) badges++; // 25 solutions badge
      if (completed >= 50) badges++; // 50 solutions badge
      if (completed >= 100) badges++; // 100 solutions badge
      return badges;
    };

    const stats = await getSolveStats(user._id);

    // Use session image as fallback if database image is invalid
    const getUserImage = () => {
      const dbImage = user.image;
      const sessionImage = session.user?.image;

      // Check if database image is valid
      if (
        dbImage &&
        dbImage.trim() !== "" &&
        dbImage !== "undefined" &&
        dbImage !== "null" &&
        dbImage !== null
      ) {
        return dbImage;
      }

      // Fallback to session image
      return sessionImage || null;
    };

    const profileData = {
      name: user.name,
      email: user.email,
      image: getUserImage(),
      totalScore: user.totalScore || 0,
      rank: userRank,
      level: getLevel(user.totalScore || 0),
      completedQuestions,
      roomsCompleted: completedQuestions,
      badges: getBadges(completedQuestions),
      streak: stats.currentStreak,
      stats,
      createdAt: user.createdAt,
      customBadges: user.customBadges || [],
      debug: {
        totalUserQuestions: allUserQuestions.length,
        testQueries,
        availableFields:
          allUserQuestions.length > 0
            ? Object.keys(allUserQuestions[0].toObject())
            : [],
      },
    };

    return NextResponse.json(profileData, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
