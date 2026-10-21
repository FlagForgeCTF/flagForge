import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import userSchema from "@/models/userSchema";
import UserQuestionModel from "@/models/userQuestionSchema";
import QuestionModel from "@/models/qustionsSchema";
import { PATH_DIFFICULTIES } from "@/models/pathSchema";

export const slugify = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/** Set of question ids the signed-in user has solved (empty for guests). */
export async function getSolvedIds() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Set<string>();
  const user = await userSchema.findOne({ email: { $eq: session.user.email } }).select("_id");
  if (!user) return new Set<string>();
  const solved = await UserQuestionModel.find({ userId: user._id }).select("questionId").lean<{ questionId: unknown }[]>();
  return new Set(solved.map((s) => String(s.questionId)));
}

/** Validates an admin-submitted path body; returns the clean fields or an error message. */
export async function parsePathInput(body: any) {
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const difficulty = body?.difficulty;
  const challenges: unknown = body?.challenges;

  if (!title || title.length > 100) return { error: "Title is required (max 100 characters)" };
  if (!slugify(title)) return { error: "Title must contain letters or numbers" };
  if (!description || description.length > 2000) return { error: "Description is required (max 2000 characters)" };
  if (!PATH_DIFFICULTIES.includes(difficulty)) return { error: `Difficulty must be one of ${PATH_DIFFICULTIES.join(", ")}` };
  if (
    !Array.isArray(challenges) ||
    challenges.length === 0 ||
    challenges.length > 100 ||
    !challenges.every((id) => typeof id === "string" && mongoose.isValidObjectId(id)) ||
    new Set(challenges).size !== challenges.length
  ) {
    return { error: "Challenges must be 1-100 distinct challenge ids" };
  }
  const found = await QuestionModel.countDocuments({ _id: { $in: challenges } });
  if (found !== challenges.length) return { error: "Some challenges do not exist" };

  return { data: { title, description, difficulty, challenges: challenges as string[] } };
}
