import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    techStack: {
      type: [String],
      default: [],
    },
    // Accept multiple categories for a project. Stored as an array of strings.
    category: {
      type: [String],
      default: [],
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
    keyFeatures: {
      type: [String],
      default: [],
    },
    highlights: {
      type: String,
      default: "",
    },
    githubUrl: {
      type: String,
      default: "",
    },
    liveUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Featured"],
      default: "Draft",
    },
    suggestedCategory: { type: String, default: "" },
    suggestedDescription: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);