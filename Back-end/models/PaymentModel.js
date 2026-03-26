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

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products"
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