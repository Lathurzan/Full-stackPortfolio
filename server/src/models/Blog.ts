import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
