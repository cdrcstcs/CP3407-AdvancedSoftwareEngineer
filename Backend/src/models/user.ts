import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../interface/Request"; // Assuming this is your IUser interface
const { ObjectId } = Schema.Types;

// Define the User Schema with explicit _id definition
const UserSchema = new Schema<IUser>({
  _id: { type: ObjectId, required: true, auto: true },  // Explicitly defining _id field as ObjectId
  imageId: { type: ObjectId, ref: 'Image', required: false }, // Optional field
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  longitude: { type: Number, required: false },
  latitude: { type: Number, required: false },
  userType: { 
    type: String, 
    enum: ["ADMIN", "USER"], 
    required: true
  },
}, { timestamps: true });

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
