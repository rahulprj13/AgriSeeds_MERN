const express = require("express");
const User = require("../models/UserModel.js");
const Product = require("../models/ProductModel.js");
const Category = require("../models/CategoryModel.js");
const Cart = require("../models/CartModel.js");
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

module.exports = router;

