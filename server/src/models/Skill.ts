import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    items: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Skill", skillSchema);
