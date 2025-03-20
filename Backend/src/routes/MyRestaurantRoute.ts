import express from "express";
import MyRestaurantController from "../controllers/MyRestaurantController";
import { validateMyRestaurantRequest } from "../middleware/Validation";
import { extractUserIdMiddleware } from "../middleware/Middleware";
import multer from "multer";
const upload = multer();

const myRestaurantRoute = express.Router();
myRestaurantRoute.get("/order", 
    // extractUserIdMiddleware, 
    MyRestaurantController.getMyRestaurantOrders);
myRestaurantRoute.patch("/order/:orderId/status", 
    // extractUserIdMiddleware, 
    MyRestaurantController.updateOrderStatus);
myRestaurantRoute.get("/", 
    // extractUserIdMiddleware, 
    MyRestaurantController.getMyRestaurant);
myRestaurantRoute.post("/", validateMyRestaurantRequest, 
    // extractUserIdMiddleware, 
    MyRestaurantController.createMyRestaurant);
myRestaurantRoute.put("/", 
    // extractUserIdMiddleware, 
    validateMyRestaurantRequest, MyRestaurantController.updateMyRestaurant);
export default myRestaurantRoute;
