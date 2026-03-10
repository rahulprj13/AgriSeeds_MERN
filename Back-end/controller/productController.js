const Product = require("../models/ProductModel");
const ProductDetail = require("../models/ProductDetailModel");

// USER PRODUCTS
exports.getProducts = async (req, res) => {
  try {

    const products = await Product.find({ status: "active" })
      .populate("category", "name");

    res.json(products);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });
  }
};


// PRODUCT DETAIL PAGE
exports.getProductDetails = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id)
      .populate("category", "name");

    const detail = await ProductDetail.findOne({
      product: req.params.id
    });

    res.json({
      product,
      detail
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });
  }
};