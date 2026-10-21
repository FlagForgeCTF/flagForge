import UserQuestionModel from "@/models/userQuestionSchema";
import userSchema from "@/models/userSchema";

// CTFd-style quadratic decay: full value for the first solver, floor reached after DECAY_SOLVES solves.
const DECAY_SOLVES = 30;
const MIN_FRACTION = 0.25;
const FIRST_BLOOD_FRACTION = 0.1;

/** Points every solver currently gets when `solveCount` users have solved the challenge. */
export function challengeValue(basePoints: number, solveCount: number) {
  const min = Math.ceil(basePoints * MIN_FRACTION);
  const solves = Math.min(Math.max(0, solveCount - 1), DECAY_SOLVES);
  return Math.ceil(basePoints - (basePoints - min) * (solves / DECAY_SOLVES) ** 2);
}

export function firstBloodBonus(basePoints: number) {
  return Math.ceil(basePoints * FIRST_BLOOD_FRACTION);
}

/**
 * Brings every solver's credited points for one challenge in line with its current value,
 * applying only the difference to totalScore so hint/chat deductions are preserved.
 * shortcut: two simultaneous solves of one challenge can leave it one step stale until the next solve; re-run recalculate-scores if that matters.
 */
export async function syncChallengeScores(question: { _id: unknown; points: number }) {
  const base = Number(question.points) || 0;
  const solves = await UserQuestionModel.find({ questionId: question._id })
    .sort({ createdAt: 1, _id: 1 })
    .select("userId awarded")
    .lean<{ _id: unknown; userId: unknown; awarded?: number }[]>();

  const value = challengeValue(base, solves.length);
  for (const [i, solve] of solves.entries()) {
    const target = value + (i === 0 ? firstBloodBonus(base) : 0);
    // Solves recorded before dynamic scoring were credited the base points.
    const current = solve.awarded ?? base;
    // Still backfill `awarded` on legacy solves even when the value is unchanged.
    if (current === target && solve.awarded !== undefined) continue;

    // Conditional update so a concurrent sync can't apply the same delta twice.
    const claimed = await UserQuestionModel.updateOne(
      { _id: solve._id, awarded: solve.awarded === undefined ? { $exists: false } : solve.awarded },
      { $set: { awarded: target } }
    );
    if (claimed.modifiedCount === 0 || target === current) continue;

    await userSchema.updateOne({ _id: solve.userId }, [
      { $set: { totalScore: { $max: [0, { $add: [{ $ifNull: ["$totalScore", 0] }, target - current] }] } } },
    ]);
  }
}
