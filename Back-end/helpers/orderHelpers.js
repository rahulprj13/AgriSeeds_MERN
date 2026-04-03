const Address = require("../models/AddressModel");

const requiredAddressFields = [
  "fullName",
  "phone",
  "addressLine1",
  "city",
  "state",
  "country",
  "pincode",
];

function validateAddress(address) {
  if (!address || typeof address !== "object") {
    return "Address is required";
  }

  for (const field of requiredAddressFields) {
    if (!address[field] || String(address[field]).trim() === "") {
      return `Address field required: ${field}`;
    }
  }

  if (!/^[6-9]\d{9}$/.test(String(address.phone).trim())) {
    return "Invalid phone number";
  }

  if (!/^\d{6}$/.test(String(address.pincode).trim())) {
    return "Invalid pincode";
  }

  return null;
}

async function saveShippingAddress(userId, address) {
  const normalized = {
    userId,
    fullName: String(address.fullName).trim(),
    phone: String(address.phone).trim(),
    addressLine1: String(address.addressLine1).trim(),
    addressLine2: address.addressLine2 ? String(address.addressLine2).trim() : "",
    city: String(address.city).trim(),
    state: String(address.state).trim(),
    country: String(address.country).trim(),
    pincode: String(address.pincode).trim(),
  };

  return Address.create(normalized);
}

module.exports = {
  validateAddress,
  saveShippingAddress,
};
