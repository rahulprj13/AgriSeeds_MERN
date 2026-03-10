const express = require("express");
const router = express.Router();
const Cart = require("../models/CartModel.js");


// add item
router.post("/add", async (req, res) => {

  const { userId, product } = req.body;

  const newItem = new Cart({
    userId,
    productId: product._id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: 1
  });

  await newItem.save();

  res.json({
    message: "Item added",
    data: newItem
  });

});


// get cart
router.get("/:userId", async (req, res) => {

  const cart = await Cart.find({ userId: req.params.userId });

  res.json({
    data: cart
  });

});


// update quantity
router.put("/:id", async (req, res) => {

  const { quantity } = req.body;

  const item = await Cart.findByIdAndUpdate(
    req.params.id,
    { quantity },
    { new: true }
  );

  res.json(item);

});


// remove item
router.delete("/:id", async (req, res) => {

  await Cart.findByIdAndDelete(req.params.id);

  res.json({
    message: "Item removed"
  });

});

module.exports = router;