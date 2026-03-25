const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const router = express.Router();

router.get("/api/wishlist", authMiddleware, getWishlist);
router.post("/api/wishlist/:productId", authMiddleware, addToWishlist);
router.delete("/api/wishlist/:productId", authMiddleware, removeFromWishlist);

module.exports = router;

