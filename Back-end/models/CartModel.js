const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
  },

  name: String,
  price: Number,
  image: String,

  quantity: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Cart", CartSchema);