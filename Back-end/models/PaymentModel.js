// =============================================================================
// FILE: models/PaymentModel.js
// PURPOSE: MongoDB schema for storing payment transaction records
// USED BY: controllers/paymentController.js (saved in verifyPayment & handlePaymentFailure)
//          controllers/paymentController.js (queried in getPaymentByOrder)
// LINKED TO: OrderModel (via orderId), UserModel (via userId)
// HOW MUCH: 1 Payment document is created per payment attempt (success or failure)
// =============================================================================

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

  // Reference to the Order this payment belongs to (OrderModel._id)
  // Used to link payment records back to orders → populated in order details
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",    // References OrderModel (must match model name in OrderModel.js)
    required: true,
  },

  // Reference to the User who made the payment (UserModel._id)
  // Used for security: only the user who paid can view/access their payment
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",   // References UserModel
    required: true,
  },

  // Payment method selected by the user in Razorpay popup
  // UPI → Google Pay / PhonePe / Paytm | Card → Debit/Credit | NetBanking → Bank transfer | COD → Cash
  paymentMethod: {
    type: String,
    enum: ["UPI", "Card", "NetBanking", "COD"],
    default: "UPI",
  },

  // Razorpay's unique payment ID (e.g., "pay_XxxxxxxxxxxxxxxX")
  // Used for: reconciliation, refunds, disputes on Razorpay dashboard
  // Stored from: razorpay_payment_id received after successful payment
  transactionId: {
    type: String,
    default: "",
  },

  // Razorpay's order ID (e.g., "order_XxxxxxxxxxxxxxxX") - created before payment
  // Different from our DB orderId - this is Razorpay's internal order reference
  // Used for: signature verification during verifyPayment
  razorpayOrderId: {
    type: String,
    default: "",
  },

  // Amount paid by the user (stored in RUPEES, not paise)
  // Example: ₹500 is stored as 500 (not 50000)
  // Razorpay sends amounts in paise - we convert to rupees before storing
  amount: {
    type: Number,
    default: 0,
  },

  // Current status of this payment
  // "pending"  → Payment initiated but not completed yet (COD orders or in-progress)
  // "success"  → Payment completed & verified by signature check
  // "failed"   → Payment failed (user cancelled, card declined, bank error, etc.)
  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },

}, {
  timestamps: true, // Adds createdAt (when payment was initiated) and updatedAt fields
});

module.exports = mongoose.model("Payment", paymentSchema);