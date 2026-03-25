const Wishlist = require("../models/WishlistModel");
const Product = require("../models/ProductModel");

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const items = await Wishlist.find({ userId }).populate("productId");
    return res.status(200).json({ data: items });
  } catch (error) {
    console.error("GET_WISHLIST_ERROR:", error);
    return res.status(500).json({ message: "Error fetching wishlist" });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await Wishlist.findOneAndUpdate(
      { userId, productId },
      { userId, productId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ message: "Saved for later" });
  } catch (error) {
    console.error("ADD_WISHLIST_ERROR:", error);
    return res.status(500).json({ message: "Error saving wishlist" });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { productId } = req.params;
    await Wishlist.findOneAndDelete({ userId, productId });
    return res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("REMOVE_WISHLIST_ERROR:", error);
    return res.status(500).json({ message: "Error removing wishlist" });
  }
};

