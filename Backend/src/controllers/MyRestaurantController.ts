import { Response } from "express";
import Restaurant from "../models/Restaurant";
import mongoose from "mongoose";
import Order from "../models/Order";
import { AuthenticatedRequest } from "../interface/Request";
import User from "../models/User";
const getMyRestaurant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: (await User.findOne())?._id });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};
const createMyRestaurant = async (req: AuthenticatedRequest, res: Response) => {
  console.log('hellohihi');
  try {
    console.log(req.body.city);
    const restaurant = new Restaurant(req.body);
    restaurant.user = (await User.findOne())?._id;
    restaurant.lastUpdated = new Date();
    await restaurant.save();
    res.status(201).send(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
const getMyRestaurantOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = (await User.findOne())?._id;
    const restaurant = await Restaurant.findOne({ user: userId });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }
    const orders = await Order.find({ restaurant: restaurant._id })
      .populate("restaurant")
      .populate("user");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};
const updateMyRestaurant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({
      user: (await User.findOne())?._id,
    });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }
    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();
    restaurant.imageId = req.body.imageId;
    await restaurant.save();
    res.status(200).send(restaurant);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }
    const restaurant = await Restaurant.findById(order.restaurant);
    if (restaurant?.user?._id.toString() !== (await User.findOne())?._id.toString()) {
      return res.status(401).send();
    }
    order.status = status;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "unable to update order status" });
  }
};
export default {
  updateOrderStatus,
  getMyRestaurantOrders,
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant
};
