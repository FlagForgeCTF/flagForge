import { NextResponse } from "next/server";
import User from "@/models/userSchema";
import UserQuestionModel from "@/models/userQuestionSchema";
import QuestionModel from "@/models/qustionsSchema";
import connect from "@/utils/db";
export const runtime = "nodejs";

// GET /api/leaderboard
export async function GET() {
  try {
    // Connect to the database
    await connect();

    // Fetch top 50 users sorted by totalScore in descending order
    const users = await User.find({})
      .sort({ totalScore: -1 })
      .limit(50) // Limit to top 50 users
      .select("name totalScore image _id");

    // Solve count and solve timeline for every listed user in one query
    const solves = await UserQuestionModel.aggregate([
      { $match: { userId: { $in: users.map((user) => user._id) } } },
      { $sort: { createdAt: 1 } },
      // Solves from before dynamic scoring have no `awarded`; fall back to the challenge's base points
      { $lookup: { from: QuestionModel.collection.name, localField: "questionId", foreignField: "_id", as: "q", pipeline: [{ $project: { points: 1 } }] } },
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 },
          timeline: {
            $push: { t: "$createdAt", points: { $ifNull: ["$awarded", { $ifNull: [{ $first: "$q.points" }, 0] }] } },
          },
        },
      },
    ]);
    const solvesByUser = new Map(solves.map((s) => [s._id.toString(), s]));

    const leaderboard = users.map((user, index) => {
      const userSolves = solvesByUser.get(user._id.toString());
      return {
        name: user.name,
        totalScore: user.totalScore,
        image: user.image,
        roomsCompleted: userSolves?.count ?? 0,
        rank: index + 1, // Rank starts from 1
        slug: user.name.replace(/\s+/g, "-"),
        // Score-over-time graph only covers the top 5
        ...(index < 5 && { history: userSolves?.timeline ?? [] }),
      };
    });

    // Return the leaderboard as JSON
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
