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


    
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories",
    required: true
  },

   quantity: {
    type: Number,
    default: 1
  },

  currentPrice: {
    type: Number,
    required: true

  }
  ,

  // Optional fields used by the frontend cart UI
  name: { type: String },
  price: { type: Number },
  imagePath: { type: String },
  weight: { type: Number },
  unit: { type: String }
}, 
{ timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);