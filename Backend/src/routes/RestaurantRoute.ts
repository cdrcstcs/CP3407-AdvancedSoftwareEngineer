import express from "express";
import { param } from "express-validator";
import RestaurantController from "../controllers/RestaurantController";
const restaurantRoute = express.Router();
restaurantRoute.get("/:restaurantId",param("restaurantId").isString().trim().notEmpty().withMessage("RestaurantId paramenter must be a valid string"), RestaurantController.getRestaurant);
restaurantRoute.get("/search/:city",param("city").isString().trim().notEmpty().withMessage("City paramenter must be a valid string"), RestaurantController.searchRestaurant);
export default restaurantRoute;