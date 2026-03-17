const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },

    price: {
      type: Number,
      min: 0,
      required:true

    },

    description: {
      type: String,
    },

    currentPrice: {
      type: Number,
      min: 0,
      required:true

    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    weight: {               
      type: Number,
      required: true
    },

    unit: {                
      type: String,
      enum: ["kg", "gram"],
      default: "gram",
      required: true
    },

    imagePath: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("products", ProductSchema);