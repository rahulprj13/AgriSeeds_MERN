const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },

  fullName: {
    type: String
  },

  phone: {
    type: String
  },

  addressLine1: {
    type: String
  },

  addressLine2: {
    type: String
  },

  city: {
    type: String
  },

  state: {
    type: String
  },

  country: {
    type: String
  },

  pincode: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Address", addressSchema);