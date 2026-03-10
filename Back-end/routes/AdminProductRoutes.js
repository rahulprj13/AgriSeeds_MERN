const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct
} = require("../controller/adminProductController");

const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const upload = require("../middleware/upload");


// CREATE PRODUCT
router.post(
  "/api/admin/products",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  createProduct
);


// GET ALL PRODUCTS
router.get(
  "/api/admin/products",
  authMiddleware,
  adminMiddleware,
  getProducts
);


// GET SINGLE PRODUCT
router.get(
  "/api/admin/products/:id",
  authMiddleware,
  adminMiddleware,
  getSingleProduct
);


// UPDATE PRODUCT
router.put(
  "/api/admin/products/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateProduct
);


// DELETE PRODUCT
router.delete(
  "/api/admin/products/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

module.exports = router;