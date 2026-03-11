// const express = require("express");
// const Category = require("../models/CategoryModel.js");

// const router = express.Router();

// // Public: Get all categories (for user UI dropdowns, filters, etc.)
// router.get("/api/categories", async (req, res) => {
//   try {
//     const categories = await Category.find().sort({ name: 1 });
//     res.json(categories);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

const { getPublicCategories } = require("../controllers/categoryController.js");

// PUBLIC CATEGORY LIST
router.get("/api/categories", getPublicCategories);

module.exports = router;