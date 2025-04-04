import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import myRestaurantRoute from "./routes/MyRestaurantRoute";
import restaurantRoute from "./routes/RestaurantRoute";
import orderRoute from "./routes/OrderRoute";
import imageRoute from "./routes/ImageRoute";
import Image from "./models/Image";
import Order from "./models/Order";
import Restaurant from "./models/Restaurant";
import User from "./models/User";
import 'dotenv/config'
import { generateImageData, generateOrders, generateRestaurants, generateUsers } from "./data";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));
app.use("/image", imageRoute);
app.use("/user", myUserRoute);
app.use("/myres/", myRestaurantRoute);
app.use("/restaurant", restaurantRoute);
app.use("/order", orderRoute);
export default app;

mongoose.connect(process.env.MONGODB || "").then(async () => {
  await Image.deleteMany();
  await User.deleteMany();
  await Restaurant.deleteMany();
  await Order.deleteMany();
  await Image.insertMany(generateImageData());
  await User.insertMany(await generateUsers());
  await Restaurant.insertMany(await generateRestaurants());
  await Order.insertMany(await generateOrders());
  app.listen(process.env.PORT, () => console.log(`Server running on PORT: 7000`));
}).catch((error) => console.log(`${error} did not connect`));