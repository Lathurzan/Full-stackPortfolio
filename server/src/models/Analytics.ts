import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // e.g., 'visitor', 'project_view', 'cv_download', 'contact_click'
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Analytics", analyticsSchema);
