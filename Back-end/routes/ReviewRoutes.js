const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  createOrUpdateReview,
  getProductReviews,
  getProductReviewSummary,
  deleteMyReview,
  getAllReviews,
  deleteReviewAdmin,
  getReviewsByProductAdmin,
} = require("../controllers/reviewController");

const router = express.Router();

// List reviews (public)
router.get("/api/products/:id/reviews", getProductReviews);
router.get("/api/products/:id/reviews/summary", getProductReviewSummary);

// Create/update review (logged-in user)
router.post("/api/products/:id/reviews", authMiddleware, createOrUpdateReview);

// Delete my review
router.delete("/api/products/:productId/reviews/:reviewId", authMiddleware, deleteMyReview);

// ADMIN ROUTES
// Get all reviews
router.get("/api/admin/reviews", authMiddleware, adminMiddleware, getAllReviews);

// Get reviews for a specific product (admin)
router.get("/api/admin/reviews/product/:productId", authMiddleware, adminMiddleware, getReviewsByProductAdmin);

// Delete review as admin
router.delete("/api/admin/reviews/:reviewId", authMiddleware, adminMiddleware, deleteReviewAdmin);

module.exports = router;

