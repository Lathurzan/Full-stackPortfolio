import mongoose from "mongoose";

const caseStudySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, default: "" },
    description: { type: String, required: true }, // short overview/description
    image: { type: String, default: "" },
    stack: { type: [String], default: [] },
    content: { type: String, default: "" }, // optional long-form content
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
    // Optional fields used by the admin form:
    problem: { type: String, default: "" },
    solution: { type: String, default: "" },
    architecture: { type: String, default: "" },
    challenges: { type: String, default: "" },
    results: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    liveDemoUrl: { type: String, default: "" },
  // layout determines whether the image appears on the left or right in the UI
  layout: { type: String, enum: ["left", "right"], default: "right" },
  },
  { timestamps: true }
);

export default mongoose.model("CaseStudy", caseStudySchema);