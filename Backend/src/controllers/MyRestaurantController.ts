import { Response } from "express";
import Restaurant from "../models/Restaurant";
import Order from "../models/Order";
import { AuthenticatedRequest } from "../interface/Request";
import User from "../models/User";
import { IUser } from "../interface/Request";
const getMyRestaurant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne() as IUser | null;  // Cast as IUser | null
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const restaurant = await Restaurant.findOne({ user: user._id }) as any;  // Cast to any to ensure type is defined
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};

const createMyRestaurant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne() as IUser | null;  // Cast as IUser | null
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const restaurant = new Restaurant(req.body);

    // Ensure restaurant is defined before assigning
    restaurant.user = user._id as any;  // Assign user._id to restaurant.user
    restaurant.lastUpdated = new Date();
    await restaurant.save();
    res.status(201).send(restaurant);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getMyRestaurantOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne() as IUser | null;  // Cast as IUser | null
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const restaurant = await Restaurant.findOne({ user: user._id }) as any;  // Cast as any
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate("restaurant")
      .populate("user");
    res.json(orders);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateMyRestaurant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne() as IUser | null;  // Cast as IUser | null
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const restaurant = await Restaurant.findOne({ user: user._id }) as any;  // Cast as any
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Update restaurant details
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
    console.log("Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId) as any;  // Cast as any
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const restaurant = await Restaurant.findById(order.restaurant) as any;  // Cast as any
    const user = await User.findOne() as IUser | null;  // Cast as IUser | null
    if (!user || !restaurant || restaurant.user?._id.toString() !== user?._id?.toString()) {
      return res.status(401).send();
    }

    order.status = status;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Unable to update order status" });
  }
};

export default {
  updateOrderStatus,
  getMyRestaurantOrders,
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
};
