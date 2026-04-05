const Cart = require("../models/CartModel");
const Order = require("../models/OrderModel");
const OrderItem = require("../models/OrderItemModel");
const Address = require("../models/AddressModel");
const Product = require("../models/ProductModel");

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Create an order from current user's cart
exports.createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const address = req.body?.address || {};
    const requiredFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "country",
      "pincode",
    ];

    for (const f of requiredFields) {
      if (!address[f] || String(address[f]).trim() === "") {
        return res.status(400).json({ message: `Address field required: ${f}` });
      }
    }

    const cartItems = await Cart.find({ userId });
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const itemsWithPrice = cartItems.map((item) => {
      const price = item.currentPrice ?? item.price;
      return {
        ...item._doc,
        price: toNumber(price),
        totalPrice: toNumber(price) * toNumber(item.quantity),
      };
    });

    const totalAmount = itemsWithPrice.reduce(
      (acc, item) => acc + toNumber(item.totalPrice),
      0
    );

    const savedAddress = await Address.create({
      userId,
      fullName: String(address.fullName).trim(),
      phone: String(address.phone).trim(),
      addressLine1: String(address.addressLine1).trim(),
      addressLine2: address.addressLine2 ? String(address.addressLine2).trim() : "",
      city: String(address.city).trim(),
      state: String(address.state).trim(),
      country: String(address.country).trim(),
      pincode: String(address.pincode).trim(),
    });

    const order = await Order.create({
      userId,
      addressId: savedAddress._id,
      totalAmount,
      orderStatus: "pending",
      paymentStatus: "pending",
    });

    const orderItems = await Promise.all(
      itemsWithPrice.map((item) =>
        OrderItem.create({
          orderId: order._id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
        })
      )
    );

    // Clear cart after order
    await Cart.deleteMany({ userId });

    return res.status(201).json({
      message: "Order created",
      order,
      items: orderItems,
    });
  } catch (error) {
    console.error("CREATE_ORDER_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// List orders for current user
// List orders for current user - UPDATED
exports.getOrdersForUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 1. Saare orders fetch karein
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    // 2. Har order ke liye uske items populate karein
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id }).populate({
        path: "productId",
        select: "name imagePath image categoryId",
        populate: { path: "categoryId", select: "name" },
      });
        
        return {
          ...order._doc,
          items: items // Ab frontend ko 'items' array milega jisme product image hogi
        };
      })
    );

    return res.status(200).json({ data: ordersWithItems });
  } catch (error) {
    console.error("GET_ORDERS_ERROR:", error);
    return res.status(500).json({ message: "Error fetching orders" });
  }
};

// Get one order + its items (only if it belongs to current user)
exports.getOrderDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const order = await Order.findOne({ _id: id, userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const items = await OrderItem.find({ orderId: order._id }).populate({
      path: "productId",
      select: "name imagePath currentPrice price weight unit categoryId",
      populate: { path: "categoryId", select: "name" },
    });

    const populatedOrder = await Order.findOne({ _id: order._id, userId }).populate(
      "addressId"
    );

    return res.status(200).json({
      order: populatedOrder || order,
      items,
    });
  } catch (error) {
    console.error("GET_ORDER_DETAILS_ERROR:", error);
    return res.status(500).json({ message: "Error fetching order" });
  }
};

// Update address for an order (only if it belongs to current user)
exports.updateOrderAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const address = req.body?.address || {};
    const requiredFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "country",
      "pincode",
    ];

    for (const f of requiredFields) {
      if (!address[f] || String(address[f]).trim() === "") {
        return res.status(400).json({ message: `Address field required: ${f}` });
      }
    }

    const order = await Order.findOne({ _id: id, userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    await Address.findByIdAndUpdate(
      order.addressId,
      {
        fullName: String(address.fullName).trim(),
        phone: String(address.phone).trim(),
        addressLine1: String(address.addressLine1).trim(),
        addressLine2: address.addressLine2 ? String(address.addressLine2).trim() : "",
        city: String(address.city).trim(),
        state: String(address.state).trim(),
        country: String(address.country).trim(),
        pincode: String(address.pincode).trim(),
      },
      { new: true }
    );

    const updatedOrder = await Order.findOne({ _id: id, userId }).populate("addressId");
    return res.status(200).json({ message: "Address updated", order: updatedOrder });
  } catch (error) {
    console.error("UPDATE_ORDER_ADDRESS_ERROR:", error);
    return res.status(500).json({ message: "Error updating address" });
  }
};

// Delete an order item and recalc order total
exports.deleteOrderItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id: orderId, itemId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    await OrderItem.findOneAndDelete({ _id: itemId, orderId: order._id });

    const remainingItems = await OrderItem.find({ orderId: order._id });
    const newTotal = remainingItems.reduce(
      (acc, it) => acc + toNumber(it.totalPrice),
      0
    );

    order.totalAmount = newTotal;
    await order.save();

    const updatedOrder = await Order.findOne({ _id: order._id, userId }).populate("addressId");
    const items = await OrderItem.find({ orderId: order._id }).populate(
      "productId",
      "name imagePath currentPrice price weight unit categoryId"
    );

    return res.status(200).json({ message: "Item removed", order: updatedOrder, items });
  } catch (error) {
    console.error("DELETE_ORDER_ITEM_ERROR:", error);
    return res.status(500).json({ message: "Error deleting item" });
  }
};

// Cancel order by user (mark cancelled, no item deletions)
exports.cancelOrderByUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (["delivered", "cancelled"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.orderStatus = "cancelled";
    order.trackingHistory.push({
      status: "cancelled",
      location: "",
      note: "Cancelled by customer",
    });
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("addressId")
      .populate("userId", "firstname lastname email mobile");

    const items = await OrderItem.find({ orderId: order._id }).populate(
      "productId",
      "name imagePath currentPrice price weight unit categoryId"
    );

    return res.status(200).json({ message: "Order cancelled", order: updatedOrder, items });
  } catch (error) {
    console.error("CANCEL_ORDER_ERROR:", error);
    return res.status(500).json({ message: "Error cancelling order" });
  }
};

// Create an order for a single product (Buy Now)
exports.createBuyNowOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { productId, quantity } = req.body || {};
    const address = req.body?.address || {};
    const qty = Math.max(1, Number(quantity || 1));

    const requiredFields = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "country",
      "pincode",
    ];
    for (const f of requiredFields) {
      if (!address[f] || String(address[f]).trim() === "") {
        return res.status(400).json({ message: `Address field required: ${f}` });
      }
    }

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const cartItem = await Cart.findOne({ userId, productId });
    if (!cartItem) {
      return res.status(400).json({ message: "Product not found in cart" });
    }
    if (cartItem.quantity < qty) {
      return res.status(400).json({ message: "Requested quantity not available in cart" });
    }

    const savedAddress = await Address.create({
      userId,
      fullName: String(address.fullName).trim(),
      phone: String(address.phone).trim(),
      addressLine1: String(address.addressLine1).trim(),
      addressLine2: address.addressLine2 ? String(address.addressLine2).trim() : "",
      city: String(address.city).trim(),
      state: String(address.state).trim(),
      country: String(address.country).trim(),
      pincode: String(address.pincode).trim(),
    });

    const price = toNumber(product.currentPrice ?? product.price);
    const totalPrice = price * qty;

    const order = await Order.create({
      userId,
      addressId: savedAddress._id,
      totalAmount: totalPrice,
      orderStatus: "processing",
      paymentStatus: "pending",
    });

    const orderItem = await OrderItem.create({
      orderId: order._id,
      productId: product._id,
      quantity: qty,
      price,
      totalPrice,
    });

    // Update cart: decrement only this product
    if (cartItem.quantity > qty) {
      cartItem.quantity -= qty;
      await cartItem.save();
    } else {
      await Cart.deleteOne({ _id: cartItem._id });
    }

    const populatedItems = [
      await OrderItem.findById(orderItem._id).populate(
        "productId",
        "name imagePath currentPrice price weight unit categoryId"
      ),
    ];

    return res.status(201).json({
      message: "Buy Now order created",
      order,
      items: populatedItems,
    });
  } catch (error) {
    console.error("CREATE_BUY_NOW_ORDER_ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

