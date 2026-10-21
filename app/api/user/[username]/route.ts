import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import UserSchema from "@/models/userSchema";
import UserQuestionModel from "@/models/userQuestionSchema";
import { getSolveStats } from "@/lib/solveStats";

export const runtime = "nodejs";

// GET /api/user/[username] - Public user profile endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await connect();

    // Await the params since it's now a Promise in newer Next.js versions
    const { username: rawUsername } = await params;
    const username = decodeURIComponent(rawUsername);

    const usernameWithSpaces = username.replace(/-/g, " ");

    // Escape regex characters to prevent ReDoS/Injection
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safeUsername = escapeRegex(username);
    const safeUsernameWithSpaces = escapeRegex(usernameWithSpaces);

    const user = await UserSchema.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${safeUsername}$`, "i") } },
        { name: { $regex: new RegExp(`^${safeUsernameWithSpaces}$`, "i") } },
      ],
    }).select("name image totalScore customBadges createdAt role");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get completion stats
    const completedQuestions = await UserQuestionModel.countDocuments({
      userId: user._id,
    });

    // Calculate rank
    const allUsers = await UserSchema.find({})
      .sort({ totalScore: -1 })
      .select("_id totalScore");
    const userRank =
      allUsers.findIndex((u) => u._id.toString() === user._id.toString()) + 1;

    // Calculate level
    const getLevel = (score: number): string => {
      if (score < 200) return "[0x1][Newbie]";
      if (score < 500) return "[0x2][Scout]";
      if (score < 1000) return "[0x3][Codebreaker]";
      if (score < 1500) return "[0x4][Hacker]";
      if (score < 2000) return "[0x5][Cipher Hunter]";
      if (score < 3000) return "[0x6][Forger]";
      return "[0x7][Flag Conqueror]";
    };

    // Calculate system badges
    const getBadges = (completed: number): number => {
      let badges = 0;
      if (completed >= 1) badges++;
      if (completed >= 5) badges++;
      if (completed >= 10) badges++;
      if (completed >= 25) badges++;
      if (completed >= 50) badges++;
      if (completed >= 100) badges++;
      return badges;
    };

    const profileData = {
      name: user.name,
      image: user.image,
      totalScore: user.totalScore || 0,
      rank: userRank,
      level: getLevel(user.totalScore || 0),
      completedQuestions,
      badges: getBadges(completedQuestions),
      customBadges: user.customBadges || [],
      createdAt: user.createdAt,
      memberSince: new Date(user.createdAt).getFullYear(),
      stats: await getSolveStats(user._id),
    };

    return NextResponse.json({
      success: true,
      user: profileData,
    });
  } catch (error) {
    console.error("Public profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
