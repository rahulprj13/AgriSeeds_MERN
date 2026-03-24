const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");

const {
  createOrderFromCart,
  getOrdersForUser,
  getOrderDetails,
  updateOrderStatus,
  updateOrderAddress,
  deleteOrderItem,
  createBuyNowOrder,
} = require("../controllers/orderController");

const router = express.Router();

// Create order from user's cart
router.post("/api/orders", authMiddleware, createOrderFromCart);

// List orders for logged-in user
router.get("/api/orders/:id", authMiddleware, getOrdersForUser);
router.get("/api/orders", authMiddleware, getOrdersForUser);

// Get order details + items for logged-in user
router.get("/api/orders/:id/details", authMiddleware, getOrderDetails);

// Get order details + items for logged-in user/admin
router.get("/api/admin/orders/:id", authMiddleware, getOrderDetails);

// Update order status/payment (user can update their own orders)
router.put("/api/orders/:id/status", authMiddleware, updateOrderStatus);

// Update order status/payment (admin/or owner)
router.put("/api/admin/orders/:id", authMiddleware, updateOrderStatus);

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

