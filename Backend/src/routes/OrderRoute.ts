import express from "express";
import OrderController from "../controllers/OrderController";
import { extractUserIdMiddleware } from "../middleware/Middleware";
const orderRoute = express.Router();
orderRoute.get("/", 
    // extractUserIdMiddleware, 
    OrderController.getMyOrders);
orderRoute.post("/", 
    // extractUserIdMiddleware, 
    OrderController.createOrder);
export default orderRoute;
