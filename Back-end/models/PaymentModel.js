const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },

  paymentMethod: {
    type: String,
    enum: ["UPI", "Card", "NetBanking", "COD"]
  },

  transactionId: {
    type: String
  },

  amount: {
    type: Number
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed"]
  }

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);