const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const { createRazorpayOrder, verifyRazorpayPayment } = require("../controllers/paymentController");

const router = express.Router();

// Create an order and Razorpay order, price computed in backend
router.post("/api/payment/create-order", authMiddleware, createRazorpayOrder);

// Verify Razorpay payment signature and finalize order in backend
router.post("/api/payment/verify", authMiddleware, verifyRazorpayPayment);

module.exports = router;
