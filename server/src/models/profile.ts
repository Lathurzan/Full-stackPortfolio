import mongoose, { Document, Schema } from "mongoose";

export interface IProfile extends Document {
  title: string;
  body: string;
  image: string;
  role: string;
  headerRole: string;
  resume: string;
  resumes: string[];
  subDescription: string;
}

const profileSchema = new Schema<IProfile>(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },

    body: {
  type: String,
  default: "",
  trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      default: "",
      trim: true,
    },

    headerRole: {
      type: String,
      default: "",
      trim: true,
    },

    resume: {
      type: String,
      default: "",
      trim: true,
    },

    resumes: {
      type: [String],
      default: [],
    },

    subDescription: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model<IProfile>("Profile", profileSchema);

export default Profile;