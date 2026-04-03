// =============================================================================
// FILE: routes/PaymentRoutes.js
// PURPOSE: Defines all API endpoints related to Razorpay payment gateway
// USED BY: server.js  →  registered as app.use(paymentRouter)
// CONTROLLER: controllers/paymentController.js (all 4 handler functions)
// MIDDLEWARE: authmiddleware.js  →  protects all routes (JWT token required)
// =============================================================================

const express = require("express");
const authMiddleware = require("../middleware/authmiddleware"); // JWT auth guard - used on ALL payment routes

const {
  createRazorpayOrder,  // Step 1: Create order on Razorpay before popup opens
  verifyPayment,        // Step 2: Verify signature after payment succeeds
  handlePaymentFailure, // Step 3: Log payment failure if user's payment fails
  getPaymentByOrder,    // Step 4: Fetch payment details by orderId (for Order Details page)
} = require("../controllers/paymentController");

const router = express.Router();

// -----------------------------------------------------------------------------
// POST /api/payment/create-order
// Called by: Frontend Checkout.jsx after order is created and user clicks "Pay Online"
// What: Sends amount + orderId to Razorpay → gets back razorpayOrderId to open popup
// Auth: Required (logged-in user only)
// -----------------------------------------------------------------------------
router.post("/api/payment/create-order", authMiddleware, createRazorpayOrder);

// -----------------------------------------------------------------------------
// POST /api/payment/verify
// Called by: Frontend Checkout.jsx inside Razorpay popup's success handler (handler.payment.captured)
// What: Verifies HMAC SHA256 signature → saves Payment in DB → marks Order as "paid"
// Auth: Required (logged-in user only)
// -----------------------------------------------------------------------------
router.post("/api/payment/verify", authMiddleware, verifyPayment);

// -----------------------------------------------------------------------------
// POST /api/payment/failed
// Called by: Frontend Checkout.jsx inside Razorpay popup's dismiss/failure handler
// What: Saves a "failed" Payment record in DB for audit trail
// Auth: Required (logged-in user only)
// -----------------------------------------------------------------------------
router.post("/api/payment/failed", authMiddleware, handlePaymentFailure);

// -----------------------------------------------------------------------------
// GET /api/payment/order/:orderId
// Called by: Frontend OrderDetails.jsx to show payment info (transactionId, method, status)
// What: Fetches Payment document linked to an orderId
// Auth: Required (logged-in user only)
// -----------------------------------------------------------------------------
router.get("/api/payment/order/:orderId", authMiddleware, getPaymentByOrder);

module.exports = router;
