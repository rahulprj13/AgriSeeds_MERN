const mongoose = require("mongoose");

const ProductDetailSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    description: {
      type: String,
    },

    brand: {
      type: String,
    },

    weight: {
      type: String,
    },

    germinationRate: {
      type: String,
    },

    suitableSeason: {
      type: String,
    },

    plantingDepth: {
      type: String,
    },

    spacing: {
      type: String,
    },

    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProductDetail", ProductDetailSchema);