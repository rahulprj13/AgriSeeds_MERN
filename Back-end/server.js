const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Load .env variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, etc.)
const app = express();

app.use(express.json());
app.use(cors());

const connectDB = require("./utils/db.js");
connectDB();

const authRouter = require("./routes/AuthRoutes.js");
const cartRouter = require("./routes/CartRoutes.js");
const categoryRouter = require("./routes/CategoryRoutes.js");
const productRouter = require("./routes/ProductRoutes.js");
const adminDashboardRouter = require("./routes/AdminDashboardRoutes.js");
const orderRouter = require("./routes/OrderRoutes.js");
const reviewRouter = require("./routes/ReviewRoutes.js");
const paymentRouter = require("./routes/PaymentRoutes.js"); // Payment gateway routes (Razorpay)
const wishlistRouter = require("./routes/WishlistRoutes.js");

app.use(authRouter);
app.use(categoryRouter);
app.use("/api/cart", cartRouter);
app.use( productRouter);
app.use(adminDashboardRouter);
app.use(orderRouter);
app.use(reviewRouter);
app.use(wishlistRouter);
app.use(paymentRouter); // Registers /api/payment/create-order, /verify, /failed, /order/:orderId
app.use("/uploads", express.static("uploads"));
  
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`server run on ${PORT} port`);
});