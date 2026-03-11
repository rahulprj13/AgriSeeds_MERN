// const express = require("express");
// const Category = require("../models/CategoryModel.js");
// const authMiddleware = require("../middleware/authmiddleware.js");
// const adminMiddleware = require("../middleware/adminMiddleware.js");

// const router = express.Router();

// // Create category
// router.post(
//   "/api/admin/categories",
//   authMiddleware,
//   adminMiddleware,
//   async (req, res) => {
//     try {
//       const { name, description, status } = req.body;

//       const existing = await Category.findOne({ name: name.trim() });
//       if (existing) {
//         return res.status(400).json({ message: "Category already exists" });
//       }

//       const category = await Category.create({
//         name: name.trim(),
//         description,
//         status,
//       });

//       res.status(201).json(category);
//     } catch (err) {
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// // Get all categories
// router.get(
//   "/api/admin/categories",
//   authMiddleware,
//   adminMiddleware,
//   async (req, res) => {
//     try {
//       const categories = await Category.find().sort({ createdAt: -1 });
//       res.json(categories);
//     } catch (err) {
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// // Get single category
// router.get(
//   "/api/admin/categories/:id",
//   authMiddleware,
//   adminMiddleware,
//   async (req, res) => {
//     try {
//       const category = await Category.findById(req.params.id);
//       if (!category) {
//         return res.status(404).json({ message: "Category not found" });
//       }
//       res.json(category);
//     } catch (err) {
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// // Update category
// router.put(
//   "/api/admin/categories/:id",
//   authMiddleware,
//   adminMiddleware,
//   async (req, res) => {
//     try {
//       const { name, description, status } = req.body;

//       const category = await Category.findByIdAndUpdate(
//         req.params.id,
//         {
//           name: name && name.trim(),
//           description,
//           status,
//         },
//         { new: true }
//       );

//       if (!category) {
//         return res.status(404).json({ message: "Category not found" });
//       }

//       res.json(category);
//     } catch (err) {
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// // Delete category
// router.delete(
//   "/api/admin/categories/:id",
//   authMiddleware,
//   adminMiddleware,
//   async (req, res) => {
//     try {
//       const category = await Category.findByIdAndDelete(req.params.id);

//       if (!category) {
//         return res.status(404).json({ message: "Category not found" });
//       }

//       res.json({ message: "Category deleted" });
//     } catch (err) {
//       res.status(500).json({ message: "Server error" });
//     }
//   }
// );

// module.exports = router;

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware.js");
const adminMiddleware = require("../middleware/adminMiddleware.js");

const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController.js");

// CREATE
router.post(
  "/api/admin/categories",
  authMiddleware,
  adminMiddleware,
  createCategory
);

// GET ALL
router.get(
  "/api/admin/categories",
  authMiddleware,
  adminMiddleware,
  getCategories
);

// GET SINGLE
router.get(
  "/api/admin/categories/:id",
  authMiddleware,
  adminMiddleware,
  getCategory
);

// UPDATE
router.put(
  "/api/admin/categories/:id",
  authMiddleware,
  adminMiddleware,
  updateCategory
);

// DELETE
router.delete(
  "/api/admin/categories/:id",
  authMiddleware,
  adminMiddleware,
  deleteCategory
);

module.exports = router;