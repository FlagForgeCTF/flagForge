import { Types } from "mongoose";
import UserQuestionModel from "@/models/userQuestionSchema";
import QuestionModel from "@/models/qustionsSchema";

const DAY_MS = 24 * 60 * 60 * 1000;
const dayKey = (t: number) => new Date(t).toISOString().slice(0, 10);

/**
 * Current and longest run of consecutive solve days. The current streak survives until
 * the end of the day after the last solve, so it doesn't reset before today's solve.
 * shortcut: days are UTC, so players far from UTC see day boundaries shifted; switch to a per-user timezone if they complain.
 */
export function computeStreaks(days: string[], now = Date.now()) {
  const sorted = [...new Set(days)].sort();
  let longest = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    const gap = i === 0 ? Infinity : Date.parse(sorted[i]) - Date.parse(sorted[i - 1]);
    run = gap === DAY_MS ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  const last = sorted[sorted.length - 1];
  const alive = last === dayKey(now) || last === dayKey(now - DAY_MS);
  return { current: alive ? run : 0, longest };
}

/** Per-category totals, daily solve counts for the past year, and streaks for one user. */
export async function getSolveStats(userId: Types.ObjectId | string) {
  const solves = await UserQuestionModel.aggregate<{ t: Date; category?: string; points: number }>([
    { $match: { userId: new Types.ObjectId(String(userId)) } },
    { $lookup: { from: QuestionModel.collection.name, localField: "questionId", foreignField: "_id", as: "q", pipeline: [{ $project: { category: 1, points: 1 } }] } },
    {
      $project: {
        _id: 0,
        t: "$createdAt",
        category: { $first: "$q.category" },
        // Solves from before dynamic scoring have no `awarded`; fall back to the challenge's base points
        points: { $ifNull: ["$awarded", { $ifNull: [{ $first: "$q.points" }, 0] }] },
      },
    },
  ]);

  const categoryMap = new Map<string, { category: string; count: number; points: number }>();
  const dayCounts = new Map<string, number>();
  for (const solve of solves) {
    const category = solve.category ?? "Deleted";
    const entry = categoryMap.get(category) ?? { category, count: 0, points: 0 };
    entry.count += 1;
    entry.points += solve.points;
    categoryMap.set(category, entry);

    const day = dayKey(new Date(solve.t).getTime());
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }

  const yearAgo = dayKey(Date.now() - 365 * DAY_MS);
  const streak = computeStreaks([...dayCounts.keys()]);
  return {
    categories: [...categoryMap.values()].sort((a, b) => b.count - a.count),
    activity: [...dayCounts].filter(([date]) => date > yearAgo).map(([date, count]) => ({ date, count })),
    currentStreak: streak.current,
    longestStreak: streak.longest,
  };
}
