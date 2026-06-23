import mongoose from "mongoose";

const caseStudySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, default: "" },
    description: { type: String, required: true },
    image: { type: String, default: "" },
    stack: { type: [String], default: [] },
    content: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
  },
  { timestamps: true }
);

export default mongoose.model("CaseStudy", caseStudySchema);
