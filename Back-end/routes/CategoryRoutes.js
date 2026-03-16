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