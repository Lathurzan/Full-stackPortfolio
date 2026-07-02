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
  links?: {
    github?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    kaggle?: string;
  };
  customLinks?: Array<{ name: string; url: string; icon?: string }>;
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
    links: {
      type: {
        github: { type: String, default: "", trim: true },
        linkedin: { type: String, default: "", trim: true },
        instagram: { type: String, default: "", trim: true },
        youtube: { type: String, default: "", trim: true },
        kaggle: { type: String, default: "", trim: true },
      },
      default: {},
    },
    customLinks: {
      type: [
        {
          name: { type: String, default: "", trim: true },
          url: { type: String, default: "", trim: true },
          icon: { type: String, default: "", trim: true },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model<IProfile>("Profile", profileSchema);

export default Profile;