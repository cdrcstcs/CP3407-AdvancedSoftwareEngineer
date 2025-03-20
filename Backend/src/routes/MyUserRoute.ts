import express from "express";
import MyUserController from "../controllers/MyUserController";
import { extractUserIdMiddleware } from "../middleware/Middleware";
const myUserRoute = express.Router();
myUserRoute.get("/", 
    // extractUserIdMiddleware, 
    MyUserController.getCurrentUser);
export default myUserRoute;
