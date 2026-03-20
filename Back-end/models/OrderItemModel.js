const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products"
  },

  quantity: {
    type: Number
  },

  price: {
    type: Number
  },

  totalPrice: {
    type: Number
  }

});

module.exports = mongoose.model("OrderItem", orderItemSchema);