const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      default: "SeedStore",
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
      default: "India",
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    workingHours: {
      type: String,
      default: "Monday - Saturday: 9 AM – 7 PM",
    },

    mapEmbedUrl: {
      type: String,
      default: "https://maps.google.com/maps?q=Ahmedabad&t=&z=13&ie=UTF8&iwloc=&output=embed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
