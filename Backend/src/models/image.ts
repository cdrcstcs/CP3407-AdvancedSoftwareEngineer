import mongoose, { Schema, Document } from "mongoose";
import { IImage } from "../interface/Request";
const imageSchema: Schema<IImage> = new Schema<IImage>({
  image: {
    type: String,
    required: true,
  },
});

// Create the Image model with the IImage interface
const Image = mongoose.model<IImage>("Image", imageSchema);

export default Image;
