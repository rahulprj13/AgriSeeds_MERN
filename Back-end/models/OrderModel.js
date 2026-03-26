const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },

  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address"
  },

  totalAmount: {
    type: Number
  },

  orderStatus: {
    type: String,
    enum: [ "processing", "shipped", "delivered", "cancelled"],
    default: "processing"
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },

  trackingNumber: {
    type: String,
    default: ""
  },

  courier: {
    type: String,
    default: ""
  },

  expectedDelivery: {
    type: Date
  },

  trackingHistory: [
    {
      status: { type: String },
      location: { type: String, default: "" },
      note: { type: String, default: "" },
      updatedAt: { type: Date, default: Date.now }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);