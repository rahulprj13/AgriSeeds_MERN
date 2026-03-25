const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");

const {
  createOrderFromCart,
  getOrdersForUser,
  getOrderDetails,
  updateOrderAddress,
  deleteOrderItem,
  createBuyNowOrder,
} = require("../controllers/orderController");

const router = express.Router();

// Create order from user's cart
router.post("/api/orders", authMiddleware, createOrderFromCart);

// List orders for logged-in user
router.get("/api/orders", authMiddleware, getOrdersForUser);

// Get order details + items for logged-in user
router.get("/api/orders/:id", authMiddleware, getOrderDetails);

// Update order address
router.put("/api/orders/:id/address", authMiddleware, updateOrderAddress);

// Delete a product (order item) from an order
router.delete(
  "/api/orders/:id/items/:itemId",
  authMiddleware,
  deleteOrderItem
);

// Create an order for a single product (Buy Now)
router.post("/api/orders/buy-now", authMiddleware, createBuyNowOrder);

module.exports = router;

