import mongoose from "mongoose";

export interface IAbout extends mongoose.Document {
  title?: string;
  body: string;
  image?: string;
}

const aboutSchema = new mongoose.Schema<IAbout>(
  {
    title: {
      type: String,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const About = mongoose.model<IAbout>("About", aboutSchema);
export default About;
