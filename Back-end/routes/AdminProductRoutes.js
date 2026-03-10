const express = require("express");
const Product = require("../models/ProductModel.js");
const Category = require("../models/CategoryModel.js");
const authMiddleware = require("../middleware/authmiddleware.js");
const adminMiddleware = require("../middleware/adminMiddleware.js");

const router = express.Router();

// Create product
router.post(
  "/api/admin/products",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { name, description, price, image, categoryId, stock, status } =
        req.body;

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ message: "Invalid category" });
      }

      const product = await Product.create({
        name,
        description,
        price,
        image,
        category: categoryId,
        stock,
        status,
      });

      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all products
router.get(
  "/api/admin/products",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const products = await Product.find()
        .populate("category", "name")
        .sort({ createdAt: -1 });
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get single product
router.get(
  "/api/admin/products/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate(
        "category",
        "name"
      );

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update product
router.put(
  "/api/admin/products/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { name, description, price, image, categoryId, stock, status } =
        req.body;

      if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(400).json({ message: "Invalid category" });
        }
      }

      const update = {
        name,
        description,
        price,
        image,
        stock,
        status,
      };

      if (categoryId) {
        update.category = categoryId;
      }

      const product = await Product.findByIdAndUpdate(req.params.id, update, {
        new: true,
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete product
router.delete(
  "/api/admin/products/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;

