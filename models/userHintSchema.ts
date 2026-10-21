import mongoose from "mongoose";

// Tracks which hints (by index) a user has unlocked for a question
const userHintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  usedHints: [{ type: Number }], // Array of hint indices
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userHintSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const UserHintModel =
  mongoose.models.UserHint || mongoose.model("UserHint", userHintSchema);

export default UserHintModel;
