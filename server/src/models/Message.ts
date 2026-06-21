import mongoose from "mongoose";

export interface IMessage extends mongoose.Document {
  name: string;
  email: string;
  message: string;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("Message", messageSchema);
export default Message;
