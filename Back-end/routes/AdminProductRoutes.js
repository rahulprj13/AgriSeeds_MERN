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


// CREATE PRODUCT
router.post(
  "/products",
  authMiddleware,
  adminMiddleware,
  createProduct
);


// GET ALL PRODUCTS
router.get(
  "/products",
  authMiddleware,
  adminMiddleware,
  getProducts
);


// GET SINGLE PRODUCT
router.get(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  getSingleProduct
);


// UPDATE PRODUCT
router.put(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  updateProduct
);


// DELETE PRODUCT
router.delete(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

module.exports = router;