const Cart = require("../models/CartModel");

exports.addToCart = async (req, res) => {
    try {
        const { userId, product } = req.body;

        // Validation: Check agar data aa raha hai
        if (!userId || !product) {
            return res.status(400).json({ message: "UserId or Product missing" });
        }

        let cartItem = await Cart.findOne({ userId, productId: product._id });

        if (cartItem) {
            cartItem.quantity += 1;
            await cartItem.save();
            return res.status(200).json({ message: "Quantity Updated", data: cartItem });
        }

        const newItem = new Cart({
            userId: userId,
            productId: product._id,
            name: product.name,
            currentPrice: product.currentPrice,
            imagePath: product.imagePath,
            quantity: 1
        });

        await newItem.save();
        res.status(201).json({ message: "Added to Cart", data: newItem });
    } catch (error) {
        console.error("BACKEND_ERROR:", error); // Ye aapke terminal/cmd mein dikhega
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || userId === "undefined") {
            return res.status(400).json({ message: "Invalid User ID" });
        }
        const cart = await Cart.find({ userId });
        res.status(200).json({ data: cart });
    } catch (error) {
        console.error("GET_CART_ERROR:", error);
        res.status(500).json({ message: "Error fetching cart" });
    }
};

// Update Quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Cart.findByIdAndUpdate(req.params.id, { quantity }, { new: true });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Error updating quantity" });
  }
};

// Remove Item
exports.removeItem = async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Item removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing item" });
  }
};