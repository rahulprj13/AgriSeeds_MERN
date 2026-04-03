const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "orders"
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },

  paymentMethod: {
    type: String,
    enum: ["razorpay", "cod"]
  },

  transactionId: {
    type: String
  },

  razorpayOrderId: {
    type: String
  },

  razorpayPaymentId: {
    type: String
  },

  currency: {
    type: String,
    default: "INR"
  },

  amount: {
    type: Number
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);