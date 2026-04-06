const crypto = require("crypto");
const Razorpay = require("../config/razorpayConfig");
const Cart = require("../models/CartModel");
const Product = require("../models/ProductModel");
const Order = require("../models/OrderModel");
const OrderItem = require("../models/OrderItemModel");
const Payment = require("../models/PaymentModel");
const Notification = require("../models/NotificationModel");
const { validateAddress, saveShippingAddress } = require("../helpers/orderHelpers");

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

async function fetchItemsForOrder(userId, isBuyNow, productId, quantity) {
  if (isBuyNow) {
    if (!productId) throw new Error("productId is required for buy now");
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const qty = Math.max(1, Number(quantity || 1));
    if (qty > product.stock) {
      throw new Error(`Only ${product.stock} items left in stock for ${product.name}`);
    }

    const unitPrice = toNumber(product.currentPrice ?? product.price);
    return [{ product, quantity: qty, unitPrice, totalPrice: unitPrice * qty }];
  }

  const cartItems = await Cart.find({ userId }).populate("productId");
  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const items = [];
  for (const cartItem of cartItems) {
    const product = await Product.findById(cartItem.productId?._id ?? cartItem.productId);
    if (!product || product.status !== "active") {
      throw new Error(`Product ${cartItem.name || cartItem.productId} is not available`);
    }

    if (cartItem.quantity > product.stock) {
      throw new Error(`Only ${product.stock} items left in stock for ${product.name}`);
    }

    const unitPrice = toNumber(product.currentPrice ?? product.price);
    items.push({ product, quantity: cartItem.quantity, unitPrice, totalPrice: unitPrice * cartItem.quantity, cartItemId: cartItem._id });
  }
  return items;
}

async function reduceStockAndClearCart(userId, items) {
  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.product._id, stock: { $gte: item.quantity } },
      update: { $inc: { stock: -item.quantity } },
    },
  }));

  if (bulkOps.length > 0) {
    const productResult = await Product.bulkWrite(bulkOps);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = item.product;
      const remaining = product.stock - item.quantity;
      if (remaining < 0) {
        throw new Error(`Only ${product.stock} items left in stock for ${product.name}`);
      }
    }
  }

  await Cart.deleteMany({ userId });
}

exports.createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { address, paymentMethod = "razorpay", isBuyNow = false, productId, quantity } = req.body || {};

    const addressError = validateAddress(address);
    if (addressError) return res.status(400).json({ message: addressError });

    if (!["razorpay", "cod"].includes(paymentMethod)) {
      return res.status(400).json({ message: "paymentMethod must be 'razorpay' or 'cod'" });
    }

    const orderItemsData = await fetchItemsForOrder(userId, isBuyNow, productId, quantity);

    const totalAmount = orderItemsData.reduce((acc, item) => acc + toNumber(item.totalPrice), 0);
    if (totalAmount <= 0) return res.status(400).json({ message: "Invalid order amount" });

    const savedAddress = await saveShippingAddress(userId, address);

    const order = await Order.create({
      userId,
      addressId: savedAddress._id,
      totalAmount,
      orderStatus: "processing",
      paymentStatus: "pending",
    });

    const orderItems = await Promise.all(
      orderItemsData.map((item) =>
        OrderItem.create({
          orderId: order._id,
          productId: item.product._id,
          quantity: item.quantity,
          price: item.unitPrice,
          totalPrice: item.totalPrice,
        })
      )
    );

    if (paymentMethod === "cod") {
      await reduceStockAndClearCart(userId, orderItemsData);
      await Payment.create({
        orderId: order._id,
        userId,
        paymentMethod,
        amount: totalAmount,
        currency: "INR",
        paymentStatus: "pending",
        transactionId: `COD_${Date.now()}`,
      });

      await Notification.create({
        message: `A new COD order has been placed`,
        type: "order",
      orderId: order._id
      });

      return res.status(201).json({
        message: "COD order placed successfully",
        orderId: order._id,
        type: "cod",
        order,
        orderItems,
      });
    }

    const razorpayPayload = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `${order._id}`,
      payment_capture: 1,
    };
    const razorpayOrder = await Razorpay.orders.create(razorpayPayload);

    await Payment.create({
      orderId: order._id,
      userId,
      paymentMethod,
      amount: totalAmount,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "pending",
    });

    return res.status(201).json({
      message: "Razorpay order created",
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: "INR",
      key: process.env.RAZORPAY_API_KEY,
      orderItems,
      razorpay: {
        amount: razorpayPayload.amount,
        currency: "INR",
        receipt: razorpayPayload.receipt,
      },
    });
  } catch (error) {
    console.error("CREATE_RAZORPAY_ORDER_ERROR", error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = req.body || {};

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !orderId) {
      return res.status(400).json({ message: "Missing verification parameters" });
    }

    const paymentRecord = await Payment.findOne({ orderId, razorpayOrderId });
    if (!paymentRecord) return res.status(404).json({ message: "Payment record not found" });

    if (paymentRecord.paymentStatus === "success") {
      return res.status(200).json({ message: "Payment already verified", orderId });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      await Payment.findByIdAndUpdate(paymentRecord._id, { paymentStatus: "failed" });
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed", orderStatus: "cancelled" });
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Validate with Razorpay server to ensure finality.
    const razorpayPayment = await Razorpay.payments.fetch(razorpayPaymentId);
    if (!razorpayPayment || razorpayPayment.status !== "captured") {
      await Payment.findByIdAndUpdate(paymentRecord._id, { paymentStatus: "failed" });
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed", orderStatus: "cancelled" });
      return res.status(400).json({ message: "Payment is not captured" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await Payment.findByIdAndUpdate(paymentRecord._id, {
      paymentStatus: "success",
      razorpayPaymentId,
      transactionId: razorpayPaymentId,
    });

    await Order.findByIdAndUpdate(orderId, { paymentStatus: "paid", orderStatus: "processing" });

    const orderItems = await OrderItem.find({ orderId });
    const itemsWithProduct = await Promise.all(
      orderItems.map(async (orderItem) => {
        const product = await Product.findById(orderItem.productId);
        return { product, quantity: orderItem.quantity };
      })
    );

    await reduceStockAndClearCart(userId, itemsWithProduct);

    await Notification.create({
      message: `A new order has been placed via Razorpay`,
      type: "order",
      orderId: order._id
    });

    return res.status(200).json({ message: "Payment verified successfully", orderId });
  } catch (error) {
    console.error("VERIFY_RAZORPAY_PAYMENT_ERROR", error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};