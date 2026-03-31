const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");
const uploadToCloudinary = require("../utils/cloudinaryUtils");

// CREATE PRODUCT

exports.createProduct = async (req, res) => {
  try {
    // Updated by Antigravity - 2026-03-31: Added check for req.file to prevent crash
    if (req.file) {
      const cloudinaryResponse = await uploadToCloudinary(req.file.path);
      imagePath = cloudinaryResponse.secure_url;
    }

    // Format description: split by newline and remove existing bullets
    const descriptionArray = req.body.description
      ? req.body.description.split("\n").map(s => s.trim().replace(/^•\s*/, "")).filter(s => s)
      : [];

    const product = new Product({
      name: req.body.name,
      description: descriptionArray,
      price: req.body.price,
      currentPrice: req.body.currentPrice,
      weight: req.body.weight,
      unit: req.body.unit,
      categoryId: req.body.categoryId,
      stock: req.body.stock,
      status: req.body.status,
      imagePath: imagePath
    });

    await product.save();
    res.json(product);

  } catch (error) {
    // Updated by Antigravity - 2026-03-31: Improved error logging
    console.error("Error in createProduct:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};


// GET ALL PRODUCTS (ADMIN)
exports.getProducts = async (req, res) => {
  try {

    const products = await Product.find()
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {
    // Updated by Antigravity - 2026-03-31: Improved error logging
    console.error("Error in getProducts:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// GET SINGLE PRODUCT
exports.getSingleProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);

  } catch (error) {
    // Updated by Antigravity - 2026-03-31: Improved error logging
    console.error("Error in getSingleProduct:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = req.body.name;
    
    // Format description: split by newline and remove existing bullets
    if (req.body.description !== undefined) {
      product.description = req.body.description
        ? req.body.description.split("\n").map(s => s.trim().replace(/^•\s*/, "")).filter(s => s)
        : [];
    }

    product.price = req.body.price;
    product.currentPrice = req.body.currentPrice;
    product.weight = req.body.weight;
    product.unit = req.body.unit;
    product.categoryId = req.body.categoryId;
    product.stock = req.body.stock;
    product.status = req.body.status;

    // IMAGE UPDATE
    // Updated by Antigravity - 2026-03-31: Added signature to existing image check
    if (req.file) {
      const cloudinaryResponse = await uploadToCloudinary(req.file.path);
      product.imagePath = cloudinaryResponse.secure_url;
    }

    await product.save();

    res.json(product);

  } catch (error) {
    // Updated by Antigravity - 2026-03-31: Improved error logging
    console.error("Error in updateProduct:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message
    });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Product deleted successfully"
    });

  } catch (error) {
    // Updated by Antigravity - 2026-03-31: Improved error logging
    console.error("Error in deleteProduct:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};