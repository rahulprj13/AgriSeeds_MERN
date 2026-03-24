const express = require("express");
const User = require("../models/UserModel.js");
const Product = require("../models/ProductModel.js");
const Category = require("../models/CategoryModel.js");
const Cart = require("../models/CartModel.js");
const Order = require("../models/OrderModel.js");
const OrderItem = require("../models/OrderItemModel.js");
const { getOrderDetails } = require("../controllers/orderController");
const authMiddleware = require("../middleware/authmiddleware.js");
const adminMiddleware = require("../middleware/adminMiddleware.js");

const router = express.Router();

// High level stats for dashboard
router.get(
  "/api/admin/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const [totalUsers, totalProducts, totalCategories, totalCartItems] =
        await Promise.all([
          User.countDocuments(),
          Product.countDocuments(),
          Category.countDocuments(),
          Cart.countDocuments(),
        ]);

      res.json({
        totalUsers,
        totalProducts,
        totalCategories,
        totalCartItems,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// List users (basic info, no passwords)
router.get(
  "/api/admin/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Cart overview (acts like simple orders list)
router.get(
  "/api/admin/carts",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const carts = await Cart.find()
        .populate("userId", "firstname lastname email")
        .sort({ createdAt: -1 });

      res.json(carts);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Admin: Get all orders (with items)
router.get(
  "/api/admin/orders",
  authMiddleware,
  async (req, res) => {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate("userId", "firstname lastname email phone");

      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await OrderItem.find({ orderId: order._id }).populate(
            "productId",
            "name imagePath image price"
          );
          return {
            ...order._doc,
            items,
          };
        })
      );

      res.json({ data: ordersWithItems });
    } catch (err) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  }
);

// Admin: Get order details by ID
// router.get(
//   "/api/admin/orders/:id",
//   authMiddleware,
//   getOrderDetails
// );

// Admin: Update order status/payment (by order ID)
router.put(
  "/api/admin/orders/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { orderStatus, paymentStatus } = req.body;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      await order.save();

      const updatedOrder = await Order.findById(order._id)
        .populate("addressId")
        .populate("userId", "firstname lastname email phone");

      // include items in response
      const items = await OrderItem.find({ orderId: order._id }).populate(
        "productId",
        "name imagePath image price"
      );

      res.json({ message: "Order updated", order: updatedOrder, items });
    } catch (err) {
      res.status(500).json({ message: "Error updating order" });
    }
  }
);

module.exports = router;

