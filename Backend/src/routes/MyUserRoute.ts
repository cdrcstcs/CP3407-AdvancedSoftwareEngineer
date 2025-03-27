import express from "express";
import { userController } from "../patterns/StrategyPattern";
const myUserRoute = express.Router();

// Route for getting the current user
myUserRoute.get("/current-user", (req, res) => {
    userController.getCurrentUser(req, res); // Use the strategy to get the current user
});
export default myUserRoute;
