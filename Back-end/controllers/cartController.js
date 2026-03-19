const Cart = require("../models/CartModel");

exports.addToCart = async (req, res) => {
    try {
        const { userId, product } = req.body;
        

        // Validation: Check agar data aa raha hai
        if (!userId || !product) {
            return res.status(400).json({ message: "UserId or Product missing" });
        }

        const productId = product._id || product.id;
        const categoryId = product.categoryId?._id || product.categoryId;
        const currentPrice = product.currentPrice ?? product.price;

        // Cart schema requires productId/categoryId/currentPrice
        if (!productId || !categoryId || currentPrice == null) {
            return res.status(400).json({ message: "Product data missing (productId/categoryId/currentPrice)" });
        }

        let cartItem = await Cart.findOne({ userId, productId, categoryId });

        if (cartItem) {
            cartItem.quantity += 1;
            await cartItem.save();
            return res.status(200).json({ message: "Quantity Updated", data: cartItem });
        }

        const newItem = new Cart({
            userId: userId,
            productId,
            categoryId,
            name: product.name,
            currentPrice,
            price: product.price ?? currentPrice,
            imagePath: product.imagePath,
            weight: product.weight,
            unit: product.unit,
            quantity: 1
        });

        await newItem.save();
        res.status(201).json({ message: "Added to Cart", data: newItem });
    } catch (error) {
        console.error("BACKEND_ERROR:", error); // Ye aapke terminal/cmd mein dikhega
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// exports.getCart = async (req, res) => {
//     try {
//         const { userId } = req.params;
//         if (!userId || userId === "undefined") {
//             return res.status(400).json({ message: "Invalid User ID" });
//         }
//         const cart = await Cart.find({ userId });
//         res.status(200).json({ data: cart });
//     } catch (error) {
//         console.error("GET_CART_ERROR:", error);
//         res.status(500).json({ message: "Error fetching cart" });
//     }
// };


exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || userId === "undefined" ) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        // 1. .populate('productId') use karke Product table se latest data mangwayein
        // 'productId' wahi naam hona chahiye jo aapke Cart Schema mein define hai
        const cartItems = await Cart.find({ userId }).populate({
            path: "productId",
            populate: { path: "categoryId", select: "name" }
        });

        // 2. Data format ko clean karein taaki Frontend ko latest stock mile
        const updatedCart = cartItems.map(item => {
            // Agar product delete ho chuka hai toh null handle karein
            if (!item.productId) return item; 

            return {
                ...item._doc,
                // Cart table ka purana data overwrite karein Product table ke latest data se
                stock: item.productId.stock,
                status: item.productId.status,
                currentPrice: item.productId.currentPrice || item.currentPrice
            };
        });

        res.status(200).json({ data: updatedCart });
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