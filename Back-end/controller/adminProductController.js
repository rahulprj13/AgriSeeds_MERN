const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");

// CREATE PRODUCT

exports.createProduct = async (req, res) => {
  try {

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.categoryId,
      stock: req.body.stock,
      status: req.body.status,
      image: req.file ? req.file.filename : ""
    });

    await product.save();

    res.json(product);

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Server error" });

  }
};


// GET ALL PRODUCTS (ADMIN)
exports.getProducts = async (req, res) => {
  try {

    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


// GET SINGLE PRODUCT
exports.getSingleProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id)
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
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
    product.description = req.body.description;
    product.price = req.body.price;
    product.category = req.body.categoryId;
    product.stock = req.body.stock;
    product.status = req.body.status;

    // IMAGE UPDATE
    if (req.file) {
      product.image = req.file.filename;
    }

    await product.save();

    res.json(product);

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Server error" });

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

    res.status(500).json({
      message: "Server error"
    });
  }
};