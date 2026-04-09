const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware.js");
const adminMiddleware = require("../middleware/adminMiddleware.js");

const { getContact, updateContact } = require("../controllers/contactController.js");
const {
  submitContactMessage,
  getAllContactMessages,
  markMessageAsRead,
  deleteMessage,
} = require("../controllers/messageController");

// GET CONTACT (PUBLIC)
router.get("/api/contact", getContact);

// UPDATE CONTACT (ADMIN ONLY)
router.put(
  "/api/admin/contact",
  authMiddleware,
  adminMiddleware,
  updateContact
);

// User Route: submit contact message( USER SIDE )
router.post("/api/contact", submitContactMessage);

// Public route for debugging (remove in production)
router.get("/api/admin/contact/public", getAllContactMessages);

router.get("/api/admin/contact", authMiddleware, adminMiddleware, getAllContactMessages);
router.put("/api/admin/contact/:id/read", authMiddleware, adminMiddleware, markMessageAsRead);
router.delete("/api/admin/contact/:id", authMiddleware, adminMiddleware, deleteMessage);

module.exports = router;
