import mongoose from "mongoose";

const workExperienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    description: { type: String },
    bullets: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("WorkExperience", workExperienceSchema);
