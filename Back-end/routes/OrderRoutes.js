const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  createOrderFromCart,
  getOrdersForUser,
  getOrderDetails,
  updateOrderAddress,
  deleteOrderItem,
  createBuyNowOrder,
  cancelOrderByUser,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/orderController");

const router = express.Router();

// Create order from user's cart
router.post("/api/user/orders", authMiddleware, createOrderFromCart);

// List orders for logged-in user
router.get("/api/orders", authMiddleware, getOrdersForUser);

// Get order details + items for logged-in user
router.get("/api/orders/:id", authMiddleware, getOrderDetails);

// Update order address
router.put("/api/orders/:id/address", authMiddleware, updateOrderAddress);

// Cancel order for customer
router.put("/api/orders/:id/cancelled", authMiddleware, cancelOrderByUser);

// Delete a product (order item) from an order
// router.delete(
//   "/api/orders/:id/items/:itemId",
//   authMiddleware,
//   deleteOrderItem
// );

// Create an order for a single product (Buy Now)
router.post("/api/orders/buy-now", authMiddleware, createBuyNowOrder);

// ADMIN ROUTES
// Get all orders (Admin)
router.get("/api/admin/orders", adminMiddleware, getAllOrders);

// Update order status (Admin) - can move between: confirmed -> processing -> packed -> shipped -> delivered
router.put("/api/admin/orders/:id/status", adminMiddleware, updateOrderStatus);

module.exports = router;

