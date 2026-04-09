const Review = require("../models/ReviewModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const mongoose = require("mongoose");

const toRating = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.min(5, Math.max(1, n));
};

exports.createOrUpdateReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id: productId } = req.params;
    const productExists = await Product.findById(productId);
    if (!productExists) return res.status(404).json({ message: "Product not found" });

    const { rating, title, comment } = req.body || {};
    const r = toRating(rating);
    if (!r) return res.status(400).json({ message: "Rating must be 1 to 5" });

    const user = await User.findById(userId).select("firstname lastname email");
    if (!user) return res.status(404).json({ message: "User not found" });

    const userName = `${user.firstname || ""} ${user.lastname || ""}`.trim();

    const update = {
      rating: r,
      title: String(title || "").trim(),
      comment: String(comment || "").trim(),
      userName,
    };

    const review = await Review.findOneAndUpdate(
      { productId, userId },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ message: "Review saved", review });
  } catch (error) {
    console.error("CREATE_REVIEW_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    return res.status(200).json({ data: reviews });
  } catch (error) {
    console.error("GET_PRODUCT_REVIEWS_ERROR:", error);
    return res.status(500).json({ message: "Error fetching reviews" });
  }
};

exports.getProductReviewSummary = async (req, res) => {
  try {
    const { id: productId } = req.params;

    const summary = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: "$productId",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    if (!summary || summary.length === 0) {
      return res.status(200).json({ data: { count: 0, avgRating: 0 } });
    }

    const row = summary[0];
    return res.status(200).json({
      data: {
        count: row.count,
        avgRating: Number(row.avgRating.toFixed(1)),
      },
    });
  } catch (error) {
    console.error("GET_PRODUCT_REVIEW_SUMMARY_ERROR:", error);
    return res.status(500).json({ message: "Error fetching review summary" });
  }
};

exports.deleteMyReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { productId, reviewId } = req.params;
    const deleted = await Review.findOneAndDelete({ _id: reviewId, productId, userId });
    if (!deleted) return res.status(404).json({ message: "Review not found" });

    return res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error("DELETE_REVIEW_ERROR:", error);
    return res.status(500).json({ message: "Error deleting review" });
  }
};

