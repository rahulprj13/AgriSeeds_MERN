const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductDetails
} = require("../controllers/productController");

router.get("/api/admin/products", getProducts);

router.get("/api/admin/products/:id", getProductDetails);

module.exports = router;