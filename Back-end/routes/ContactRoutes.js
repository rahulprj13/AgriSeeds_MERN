const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware.js");
const adminMiddleware = require("../middleware/adminMiddleware.js");

const { getContact, updateContact } = require("../controllers/contactController.js");

// GET CONTACT (PUBLIC)
router.get("/api/contact", getContact);

// UPDATE CONTACT (ADMIN ONLY)
router.put(
  "/api/admin/contact",
  authMiddleware,
  adminMiddleware,
  updateContact
);

module.exports = router;
