const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");

// CREATE PRODUCT

    exports.createProduct = async (req, res) => {
        try {
      
          const { name, description, price, categoryId, stock, status } = req.body;
      
          const image = req.file ? req.file.filename : "";
      
          const category = await Category.findById(categoryId);
      
          if (!category) {
            return res.status(400).json({
              message: "Invalid category"
            });
          }
      
          const product = await Product.create({
            name,
            description,
            price,
            image,
            category: categoryId,
            stock,
            status
          });
      
          res.status(201).json({
            message: "Product created successfully",
            data: product
          });
      
        } catch (error) {
      
          console.log(error);
      
          res.status(500).json({
            message: "Server error"
          });
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

    const { name, description, price, image, categoryId, stock, status } = req.body;

    const updateData = {
      name,
      description,
      price,
      image,
      stock,
      status
    };

    if (categoryId) {
      updateData.category = categoryId;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      message: "Product updated",
      data: product
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });
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