import mongoose, { Schema, model, Types } from "mongoose";

export const PATH_DIFFICULTIES = ["Easy", "Medium", "Hard", "Insane"] as const;

export interface LearningPath {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  difficulty: (typeof PATH_DIFFICULTIES)[number];
  // Ordered steps; each must be solved to unlock the next
  challenges: Types.ObjectId[];
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const pathSchema = new Schema<LearningPath>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true, maxlength: 2000 },
    difficulty: { type: String, enum: PATH_DIFFICULTIES, default: "Easy" },
    challenges: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

const PathModel = mongoose.models.Path || model<LearningPath>("Path", pathSchema);

export default PathModel;
