const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "orders"
      },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["order", "cancelled", "user_update"], 
      required: true 
    },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);