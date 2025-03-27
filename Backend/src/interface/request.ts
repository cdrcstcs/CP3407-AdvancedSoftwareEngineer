import { Request } from "express";
import User from "../models/User";
import { Document } from "mongoose";

// Extending Express Request with a userId
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

// IImage Interface for Image model
export interface IImage extends Document {
  image: string;  // This field is of type string, which stores the filename or path of the image
}

// IUser Interface for User model
export interface IUser extends Document {
  imageId: IImage["_id"]; // Reference to the Image model
  name: string;
  email: string;
  password: string;
  phone: string;  // Changed from Number to String
  longitude?: number;  // Optional
  latitude?: number;  // Optional
  userType: "ADMIN" | "USER";  // Enum for user types
}

// Interface for the User Retrieval Strategy
export interface UserRetrievalStrategy {
  getCurrentUser(req: AuthenticatedRequest): Promise<IUser | null>;
}

// FindByIdStrategy class implementing the UserRetrievalStrategy interface
export class FindByIdStrategy implements UserRetrievalStrategy {
  async getCurrentUser(): Promise<IUser | null> {
    const currentUser = await User.findOne({ _id: (await User.findOne())?._id });
    return currentUser;
    ;
  }
}
