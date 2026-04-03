// =============================================================================
// FILE: controllers/paymentController.js
// PURPOSE: Handles all Razorpay payment gateway operations
// USED BY: routes/PaymentRoutes.js  →  server.js  →  Frontend Checkout.jsx
// PACKAGE USED: razorpay (npm install razorpay)
// HOW MUCH: This file handles 3 main operations:
//   1. createRazorpayOrder  → Creates a payment order on Razorpay (₹ amount)
//   2. verifyPayment        → Verifies payment signature after user pays
//   3. getPaymentByOrder    → Fetches payment record linked to an order
// =============================================================================

const Razorpay = require("razorpay"); // Razorpay Node SDK - used to create orders & interact with Razorpay API
const crypto = require("crypto");     // Node.js built-in - used to verify the HMAC SHA256 payment signature

// --- Mongoose Models used in this file ---
const Order = require("../models/OrderModel");     // Used to update paymentStatus after successful payment
const Payment = require("../models/PaymentModel"); // Used to save and retrieve payment records in DB

// =============================================================================
// RAZORPAY INSTANCE SETUP
// Creates one shared Razorpay instance using your credentials from .env
// key_id     → Your Razorpay Test/Live Key ID     (stored in .env as RAZORPAY_KEY_ID)
// key_secret → Your Razorpay Test/Live Key Secret (stored in .env as RAZORPAY_KEY_SECRET)
// Amount used: this instance is reused across all payment functions
// =============================================================================
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// =============================================================================
// 1. CREATE RAZORPAY ORDER
// Route: POST /api/payment/create-order
// Auth:  Required (authMiddleware)
// When called: After user fills address on Checkout page and clicks "Pay Online"
// What it does:
//   - Takes orderId + totalAmount from request body
//   - Creates a Razorpay payment order (amount in paise = ₹ * 100)
//   - Returns razorpayOrderId to frontend so the Razorpay popup can open
// Amount conversion: ₹1 = 100 paise, so ₹500 = 50000 paise
// =============================================================================
exports.createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Extract orderId and amount from frontend request body
    // orderId   → Our DB order ID (already created before payment)
    // amount    → Total order amount in RUPEES (e.g., 500)
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: "orderId and amount are required" });
    }

    // Verify the order exists in DB and belongs to this user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Razorpay requires amount in PAISE (smallest INR unit)
    // Formula: rupees * 100 = paise
    // Example: ₹500 → 50000 paise
    const amountInPaise = Math.round(Number(amount) * 100);

    // Options object passed to Razorpay to create a payment order
    const options = {
      amount:   amountInPaise,   // Amount in paise (REQUIRED)
      currency: "INR",           // Currency - INR for Indian Rupees (REQUIRED)
      receipt:  `receipt_${orderId}`, // Unique receipt ID (used for tracking, max 40 chars)
      notes: {
        // Extra metadata stored on Razorpay dashboard (useful for tracking)
        orderId: orderId.toString(), // Our DB order ID
        userId:  userId.toString(),  // Who placed this order
      },
    };

    // Call Razorpay API to create an order - returns a Razorpay order object
    // rzpOrder.id → This is the razorpayOrderId frontend needs to open the payment popup
    const rzpOrder = await razorpay.orders.create(options);

    // Send back the Razorpay order details to frontend
    // Frontend will use rzpOrder.id to open Razorpay checkout modal
    return res.status(200).json({
      message:         "Razorpay order created successfully",
      razorpayOrderId: rzpOrder.id,   // Used by frontend to open Razorpay popup
      amount:          rzpOrder.amount, // Amount in paise (for frontend display)
      currency:        rzpOrder.currency,
      orderId:         orderId,        // Our DB order ID (sent back for reference)
    });

  } catch (error) {
    console.error("CREATE_RAZORPAY_ORDER_ERROR:", error);
    return res.status(500).json({ message: "Failed to create payment order", error: error.message });
  }
};


// =============================================================================
// 2. VERIFY PAYMENT (Most Important Step!)
// Route: POST /api/payment/verify
// Auth:  Required (authMiddleware)
// When called: After user completes payment in Razorpay popup (success callback)
// What it does:
//   - Receives payment details from Razorpay (razorpayOrderId, paymentId, signature)
//   - Verifies the HMAC SHA256 signature using KEY_SECRET to prevent fraud
//   - If valid: saves Payment record in DB + updates Order paymentStatus to "paid"
//   - If invalid: returns error (payment tampering detected)
// Security: Signature verification prevents fake/tampered payment submissions
// =============================================================================
exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // These 4 values come from Razorpay after successful payment (sent by frontend)
    const {
      razorpay_order_id,   // Razorpay's order ID (created in createRazorpayOrder)
      razorpay_payment_id, // Unique payment ID generated by Razorpay after payment
      razorpay_signature,  // HMAC SHA256 signature to verify payment authenticity
      orderId,             // Our DB order ID (to update order paymentStatus)
      paymentMethod,       // Payment method used (UPI, Card, NetBanking)
      amount,              // Amount paid (in rupees, for our DB record)
    } = req.body;

    // --- SIGNATURE VERIFICATION (Security Check) ---
    // Razorpay generates signature using: HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, KEY_SECRET)
    // We recreate this hash and compare it with the one sent by Razorpay
    // If they match → payment is genuine. If not → payment was tampered/fake.
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET) // Use our secret key
      .update(`${razorpay_order_id}|${razorpay_payment_id}`) // Input: orderId|paymentId
      .digest("hex"); // Output: hex string

    // Compare our generated signature with Razorpay's signature
    if (generatedSignature !== razorpay_signature) {
      // Signatures don't match → payment is invalid / tampered
      return res.status(400).json({ message: "Payment verification failed: Invalid signature" });
    }
    // --- Signature is VALID - Payment is genuine ---

    // Find the order in our DB to update its payment status
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Save Payment record in our MongoDB PaymentModel
    // This creates a permanent record of this transaction in our DB
    // Fields match PaymentModel schema (models/PaymentModel.js)
    const payment = await Payment.create({
      orderId:       orderId,            // Links payment to our Order (ObjectId ref)
      userId:        userId,             // Links payment to the User (ObjectId ref)
      paymentMethod: paymentMethod || "UPI", // UPI / Card / NetBanking (from Razorpay popup)
      transactionId: razorpay_payment_id,    // Razorpay's unique payment ID (for reconciliation)
      amount:        Number(amount),         // Amount paid in rupees (e.g., 500)
      paymentStatus: "success",              // Payment succeeded
    });

    // Update the Order's paymentStatus from "pending" → "paid"
    // This is critical: order only counts as confirmed when payment is "paid"
    order.paymentStatus = "paid";
    await order.save();

    return res.status(200).json({
      message:   "Payment verified and recorded successfully",
      payment,   // The saved Payment document
      order,     // The updated Order document (paymentStatus: "paid")
    });

  } catch (error) {
    console.error("VERIFY_PAYMENT_ERROR:", error);
    return res.status(500).json({ message: "Payment verification failed", error: error.message });
  }
};


// =============================================================================
// 3. GET PAYMENT BY ORDER ID
// Route: GET /api/payment/order/:orderId
// Auth:  Required (authMiddleware)
// When called: On Order Details page to show payment info to user
// What it does:
//   - Finds the Payment record linked to a specific orderId
//   - Returns transaction ID, amount, method, and status
// =============================================================================
exports.getPaymentByOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { orderId } = req.params;

    // Find payment associated with this orderId and userId (security: only user's own payments)
    const payment = await Payment.findOne({ orderId, userId });

    if (!payment) {
      // Not an error - order might be COD or payment not done yet
      return res.status(200).json({ payment: null, message: "No payment record found" });
    }

    return res.status(200).json({ payment });

  } catch (error) {
    console.error("GET_PAYMENT_ERROR:", error);
    return res.status(500).json({ message: "Error fetching payment details", error: error.message });
  }
};


// =============================================================================
// 4. HANDLE PAYMENT FAILURE
// Route: POST /api/payment/failed
// Auth:  Required (authMiddleware)
// When called: If user's payment fails in the Razorpay popup (failure callback)
// What it does:
//   - Saves a failed Payment record in DB
//   - Order paymentStatus remains "pending" (not changed to "paid")
// =============================================================================
exports.handlePaymentFailure = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { orderId, razorpay_order_id, error_code, error_description, amount } = req.body;

    // Save a failed payment record for audit/support purposes
    const payment = await Payment.create({
      orderId:       orderId,
      userId:        userId,
      paymentMethod: "Card", // Default fallback - actual method is unknown on failure
      transactionId: razorpay_order_id || "failed", // Razorpay order ID (not payment ID since it failed)
      amount:        Number(amount) || 0,
      paymentStatus: "failed", // Payment failed
    });

    return res.status(200).json({
      message: "Payment failure recorded",
      error:   error_description || "Payment failed",
      payment,
    });

  } catch (error) {
    console.error("PAYMENT_FAILURE_RECORD_ERROR:", error);
    return res.status(500).json({ message: "Error recording payment failure", error: error.message });
  }
};
