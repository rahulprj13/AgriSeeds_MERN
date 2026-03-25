const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const {
  createOrUpdateReview,
  getProductReviews,
  getProductReviewSummary,
  deleteMyReview,
} = require("../controllers/reviewController");

const router = express.Router();

// List reviews (public)
router.get("/api/products/:id/reviews", getProductReviews);
router.get("/api/products/:id/reviews/summary", getProductReviewSummary);

// Create/update review (logged-in user)
router.post("/api/products/:id/reviews", authMiddleware, createOrUpdateReview);

// Delete my review
router.delete("/api/products/:productId/reviews/:reviewId", authMiddleware, deleteMyReview);

module.exports = router;

