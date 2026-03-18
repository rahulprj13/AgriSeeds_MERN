const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true
  },

  name: String,
  imagePath: String,

  quantity: {
    type: Number,
    default: 1
  },

  currentPrice: {
    type: Number,
    required: true

  }
}, 
{ timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);