const Category = require("../models/CategoryModel.js");

// CREATE CATEGORY (ADMIN)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const existing = await Category.findOne({ name: name.trim() });

    if (existing) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      status,
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL CATEGORIES (ADMIN)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET SINGLE CATEGORY
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name && name.trim(),
        description,
        status,
      },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json({
      message: "Category deleted",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUBLIC CATEGORY LIST
exports.getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};