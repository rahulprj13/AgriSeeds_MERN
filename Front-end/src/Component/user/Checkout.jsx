// =============================================================================
// FILE: src/Component/user/Checkout.jsx
// PURPOSE: Checkout page with address form + Razorpay payment gateway integration
// PAYMENT FLOW:
//   1. User fills address + selects payment method (Razorpay / COD)
//   2. On "Place Order" -> createOrderFromCart or createBuyNowOrder called (backend)
//   3. If Razorpay -> POST /api/payment/create-order -> gets razorpayOrderId
//   4. Razorpay popup opens -> user pays -> success/failure callback fires
//   5. Success -> POST /api/payment/verify -> signature verified -> order marked "paid"
//   6. Failure -> POST /api/payment/failed -> failure logged in DB
//   7. COD -> order placed directly (no payment popup, paymentStatus stays "pending")
// PACKAGES USED:
//   - axios          -> API calls to backend
//   - react-hook-form -> address form validation
//   - react-toastify  -> success/error notifications
//   - Razorpay JS SDK -> loaded via <script> in index.html (window.Razorpay)
// =============================================================================

import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import {
  Plus, Minus, Trash2, ShoppingBag, MapPin, ArrowLeft,
  CreditCard, Truck, Smartphone
} from "lucide-react";

// Backend base URL - all API calls are prefixed with this
const API_URL = "http://localhost:5000";

// ============================================================================
// RAZORPAY PUBLIC KEY (KEY_ID)
// This is SAFE to put on frontend - it is the public identifier only
// Replace with your actual KEY_ID from: https://dashboard.razorpay.com/app/keys
// Test keys start with: rzp_test_
// Live keys start with: rzp_live_
// WARNING: KEY_SECRET must NEVER be placed here - backend only!
// ============================================================================
const RAZORPAY_KEY_ID = "rzp_test_REPLACE_WITH_YOUR_KEY_ID";

// Address form validation rules (used by react-hook-form)
// Each rule is applied to its corresponding input field in the form
const validationRules = {
  fullName: {
    required: "Full Name is required",
    pattern: { value: /^[a-zA-Z\s]*$/, message: "Only characters are allowed" },
    minLength: { value: 3, message: "Minimum 3 characters required" },
  },
  phone: {
    required: "Phone number is required",
    pattern: { value: /^[6-9]\d{9}$/, message: "Invalid Indian phone number (10 digits)" },
  },
  addressLine1: {
    required: "Address is required",
    validate: (value) => !/<[^>]*>/g.test(value) || "HTML tags are not allowed",
  },
  addressLine2: {
    required: "Address Line 2 is required",
    validate: (value) => !/<[^>]*>/g.test(value) || "HTML tags are not allowed",
  },
  city: {
    required: "City is required",
    pattern: { value: /^[a-zA-Z\s]*$/, message: "Only characters are allowed" },
  },
  state: {
    required: "State is required",
    pattern: { value: /^[a-zA-Z\s]*$/, message: "Only characters are allowed" },
  },
  pincode: {
    required: "Pincode is required",
    pattern: { value: /^\d{6}$/, message: "Pincode must be exactly 6 digits" },
  },
};

// ============================================================================
// PAYMENT METHOD OPTIONS
// isRazorpay: true  -> opens Razorpay popup  (POST /api/payment/create-order)
// isRazorpay: false -> COD flow (no popup, order is already created above)
// ============================================================================
const PAYMENT_METHODS = [
  {
    id: "upi",
    value: "UPI",
    label: "UPI / Online Payment",
    description: "Pay via Google Pay, PhonePe, Cards, Net Banking (Razorpay)",
    icon: Smartphone,
    isRazorpay: true,
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "cod",
    value: "COD",
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives at your door",
    icon: Truck,
    isRazorpay: false,
    color: "from-emerald-500 to-green-600",
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useContext(AuthContext);
  const {
    cart,
    totalPrice: cartTotal,
    reloadCart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
  } = useContext(CartContext);

  const [loading, setLoading] = useState(false);

  // selectedPayment: which payment method the user has chosen ("UPI" or "COD")
  // Default is "UPI" (Razorpay online payment)
  const [selectedPayment, setSelectedPayment] = useState("UPI");

  // Buy Now mode: user clicked "Buy Now" on product page (bypasses cart)
  const isBuyNow = location.state?.isBuyNow;
  const buyNowProduct = location.state?.buyNowProduct;
  const [buyNowQty, setBuyNowQty] = useState(1);

  // Limit buy-now qty to what's in the cart (backend decrements cart item)
  const buyNowCartItem =
    isBuyNow && buyNowProduct
      ? cart.find((ci) => {
          const pid = ci.productId?._id || ci.productId;
          return String(pid) === String(buyNowProduct._id);
        })
      : null;
  const buyNowMaxQty = isBuyNow ? Number(buyNowCartItem?.quantity ?? 1) : null;

  // Items to display: single product for buy-now, full cart for normal checkout
  const items = useMemo(() => {
    if (isBuyNow && buyNowProduct) return [{ ...buyNowProduct, quantity: buyNowQty }];
    return cart || [];
  }, [cart, isBuyNow, buyNowProduct, buyNowQty]);

  // Total price: buy-now = product price x qty; normal = cart context total
  const finalTotalPrice = useMemo(() => {
    if (isBuyNow && buyNowProduct)
      return Number(buyNowProduct.currentPrice || buyNowProduct.price) * buyNowQty;
    return cartTotal;
  }, [cartTotal, isBuyNow, buyNowProduct, buyNowQty]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onTouched", defaultValues: { country: "India" } });

  // Forces numeric-only input for phone and pincode fields
  const handleNumericInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  };

  const handleRemoveItem = (itemId) => {
    const confirmRemoval = window.confirm("Are you sure you don't want to buy this product?");
    if (confirmRemoval) {
      if (isBuyNow) {
        toast.info("Buy Now cancelled");
        navigate(-1);
      } else {
        removeFromCart(itemId);
        toast.success("Item removed from checkout");
      }
    }
  };

  // ============================================================================
  // OPEN RAZORPAY POPUP
  // Called after our DB order is created and razorpayOrderId is fetched from backend
  // Params:
  //   rzpOrderId -> Razorpay's order ID (e.g., "order_Xxxxxxxxxxxxxx")
  //   dbOrderId  -> Our MongoDB Order._id (to update paymentStatus after verify)
  //   amount     -> Total in RUPEES (Razorpay popup converts to paise internally)
  //   headers    -> JWT token header for axios calls inside callbacks
  // ============================================================================
  const openRazorpayPopup = (rzpOrderId, dbOrderId, amount, headers) => {
    const options = {
      key:      RAZORPAY_KEY_ID,  // Public Razorpay key (safe on frontend)
      amount:   Math.round(amount * 100), // Amount in PAISE: Rs.500 -> 50000 paise
      currency: "INR",
      name:     "AgriSeeds",
      description: "Seed Order Payment",
      order_id: rzpOrderId, // Razorpay's order ID (from /api/payment/create-order)
      prefill: {
        // Pre-fill user info in the popup for convenience
        name:    user?.firstname ? `${user.firstname} ${user.lastname || ""}`.trim() : "",
        email:   user?.email || "",
        contact: user?.mobile || "",
      },
      theme: { color: "#16a34a" }, // AgriSeeds brand green (Tailwind green-600)

      // -----------------------------------------------------------------------
      // SUCCESS CALLBACK
      // Razorpay calls this after payment succeeds with 3 values:
      //   razorpay_payment_id -> unique payment ID (e.g., "pay_Xxxxxxxxxx")
      //   razorpay_order_id   -> same as rzpOrderId above
      //   razorpay_signature  -> HMAC SHA256 of (orderId|paymentId) with KEY_SECRET
      // We send all 3 to backend -> backend verifies signature -> marks order "paid"
      // -----------------------------------------------------------------------
      handler: async (response) => {
        try {
          setLoading(true);
          await axios.post(
            `${API_URL}/api/payment/verify`,
            {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId:       dbOrderId,
              paymentMethod: selectedPayment,
              amount:        amount,
            },
            { headers }
          );
          toast.success("Payment successful! Order confirmed.");
          if (typeof reloadCart === "function") await reloadCart();
          navigate(`/orders/${dbOrderId}`);
        } catch (err) {
          toast.error(err?.response?.data?.message || "Payment verification failed");
          navigate(`/orders/${dbOrderId}`);
        } finally {
          setLoading(false);
        }
      },

      // -----------------------------------------------------------------------
      // MODAL DISMISS (user closes popup without paying)
      // Logs a "failed" payment record to backend for audit trail
      // -----------------------------------------------------------------------
      modal: {
        ondismiss: async () => {
          toast.error("Payment cancelled. Order saved - you can retry payment later.");
          try {
            await axios.post(
              `${API_URL}/api/payment/failed`,
              {
                orderId:           dbOrderId,
                razorpay_order_id: rzpOrderId,
                error_description: "User dismissed the payment popup",
                amount:            amount,
              },
              { headers }
            );
          } catch (_) { /* silently ignore */ }
          navigate(`/orders/${dbOrderId}`);
        },
      },
    };

    const rzp = new window.Razorpay(options);

    // Handle payment failure inside the popup (card declined, bank error, etc.)
    rzp.on("payment.failed", async (response) => {
      toast.error(`Payment failed: ${response.error.description}`);
      try {
        await axios.post(
          `${API_URL}/api/payment/failed`,
          {
            orderId:           dbOrderId,
            razorpay_order_id: rzpOrderId,
            error_code:        response.error.code,
            error_description: response.error.description,
            amount:            amount,
          },
          { headers }
        );
      } catch (_) { /* silently ignore */ }
    });

    rzp.open(); // Opens the Razorpay modal popup
  };

  // ============================================================================
  // FORM SUBMIT HANDLER
  // This runs when "Place Order / Pay Now" button is clicked (after form validates)
  // Step 1: Create DB order   -> POST /api/user/orders  OR  /api/orders/buy-now
  // Step 2a (Razorpay): Create Razorpay order -> POST /api/payment/create-order
  //                     Open popup -> success -> POST /api/payment/verify
  // Step 2b (COD): Show success toast + navigate to orders page
  // ============================================================================
  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      let dbOrder;

      // --- STEP 1: Create order in MongoDB ---
      if (isBuyNow) {
        const res = await axios.post(
          `${API_URL}/api/orders/buy-now`,
          { address: formData, productId: buyNowProduct?._id, quantity: buyNowQty },
          { headers }
        );
        dbOrder = res.data.order;
      } else {
        const res = await axios.post(
          `${API_URL}/api/user/orders`,
          { address: formData },
          { headers }
        );
        dbOrder = res.data.order;
      }

      // --- STEP 2: Pay based on selected method ---
      const selectedMethod = PAYMENT_METHODS.find((m) => m.value === selectedPayment);

      if (selectedMethod?.isRazorpay) {
        // Online Payment: Create Razorpay order -> get rzpOrderId -> open popup
        const payRes = await axios.post(
          `${API_URL}/api/payment/create-order`,
          { orderId: dbOrder._id, amount: finalTotalPrice },
          { headers }
        );
        setLoading(false);
        // Open Razorpay modal (success/failure handled inside openRazorpayPopup)
        openRazorpayPopup(payRes.data.razorpayOrderId, dbOrder._id, finalTotalPrice, headers);
      } else {
        // COD: No payment popup needed - order stays with paymentStatus: "pending"
        toast.success("Order placed! Pay when delivered.");
        if (typeof reloadCart === "function") await reloadCart();
        navigate(`/orders/${dbOrder._id}`);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 pt-10">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shopping
        </button>

        <h1 className="text-3xl font-black text-slate-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">

            {/* ============================================================== */}
            {/* ORDER ITEMS LIST                                                */}
            {/* ============================================================== */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
              <h2 className="text-xl font-black text-slate-800 mb-4">Order Items</h2>
              {items.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-center text-slate-500">
                  <ShoppingBag size={40} className="text-slate-300 mb-3" />
                  <p className="font-bold">Your checkout is empty.</p>
                  <button type="button" onClick={() => navigate("/")} className="mt-4 text-green-600 font-black underline">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const currentStock = Number(item.stock ?? 10);
                    const isOutOfStock = currentStock <= 0 || (item.status && item.status !== "active");
                    const canIncrement = isBuyNow
                      ? buyNowMaxQty != null ? item.quantity < buyNowMaxQty : item.quantity < currentStock
                      : !isOutOfStock && item.quantity < currentStock;

                    const itemImage = item.imagePath
                      ? item.imagePath.startsWith("http") ? item.imagePath : `${API_URL}/uploads/${item.imagePath}`
                      : "https://placehold.co/400x400?text=Product";

                    return (
                      <div
                        key={item._id || `${item.productId}-${item.name}`}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-100 rounded-2xl p-4"
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div
                            onClick={() => navigate(`/category/${item.productId?.categoryId?.name}/${item.productId?.name}/${item.productId?._id}`)}
                            className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:border-green-500 transition-all group"
                          >
                            <img src={itemImage} alt={item.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <div>
                            <p onClick={() => navigate(`/category/${item.productId?.categoryId?.name}/${item.productId?.name}/${item.productId?._id}`)} className="font-black text-slate-900 cursor-pointer hover:text-green-600 transition-colors">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{item.weight} {item.unit}</p>
                            <p className="text-sm text-slate-500 font-medium mt-1">Price: ₹{item.currentPrice ?? item.price}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                            <button type="button" onClick={() => { if (isBuyNow) setBuyNowQty((p) => Math.max(1, p - 1)); else decrementQuantity(item._id, item.quantity); }} className="p-2 hover:bg-white hover:text-red-500 rounded-lg transition-all" disabled={isOutOfStock || item.quantity <= 1}>
                              <Minus size={16} strokeWidth={3} />
                            </button>
                            <span className="w-10 text-center font-black text-slate-800">{item.quantity}</span>
                            <button type="button" onClick={() => { if (isBuyNow) setBuyNowQty((p) => (p < (buyNowMaxQty ?? currentStock) ? p + 1 : p)); else canIncrement && incrementQuantity(item._id, item.quantity); }} className="p-2 hover:bg-white hover:text-green-600 rounded-lg transition-all disabled:opacity-30" disabled={!canIncrement}>
                              <Plus size={16} strokeWidth={3} />
                            </button>
                          </div>
                          <div className="text-right min-w-20">
                            <p className="font-black text-slate-900">₹{(item.currentPrice ?? item.price) * item.quantity}</p>
                            <p className="text-xs text-slate-500 font-bold">₹{item.currentPrice ?? item.price} / unit</p>
                          </div>
                          <button type="button" onClick={() => handleRemoveItem(item._id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Remove item">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* DELIVERY ADDRESS FORM                                           */}
            {/* All fields validated via validationRules using react-hook-form  */}
            {/* ============================================================== */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <MapPin size={20} /> Delivery Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">Full Name *</label>
                  <input {...register("fullName", validationRules.fullName)} className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.fullName ? "border-red-500 bg-red-50" : "border-slate-200"}`} />
                  {errors.fullName && <p className="text-red-500 text-xs font-bold">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">Phone *</label>
                  <input type="text" maxLength={10} onInput={handleNumericInput} {...register("phone", validationRules.phone)} className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.phone ? "border-red-500 bg-red-50" : "border-slate-200"}`} />
                  {errors.phone && <p className="text-red-500 text-xs font-bold">{errors.phone.message}</p>}
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-bold text-slate-600">Address Line 1 *</label>
                  <input {...register("addressLine1", validationRules.addressLine1)} className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.addressLine1 ? "border-red-500 bg-red-50" : "border-slate-200"}`} />
                  {errors.addressLine1 && <p className="text-red-500 text-xs font-bold">{errors.addressLine1.message}</p>}
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-bold text-slate-600">Address Line 2</label>
                  <input {...register("addressLine2", validationRules.addressLine2)} className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.addressLine2 ? "border-red-500 bg-red-50" : "border-slate-200"}`} />
                  {errors.addressLine2 && <p className="text-red-500 text-xs font-bold">{errors.addressLine2.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">City *</label>
                  <input {...register("city", validationRules.city)} className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.city ? "border-red-500" : "border-slate-200"}`} />
                  {errors.city && <p className="text-red-500 text-xs font-bold">{errors.city.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">State *</label>
                  <input {...register("state", validationRules.state)} className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.state ? "border-red-500" : "border-slate-200"}`} />
                  {errors.state && <p className="text-red-500 text-xs font-bold">{errors.state.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">Country</label>
                  <input {...register("country")} readOnly className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 font-bold cursor-not-allowed outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-600">Pincode *</label>
                  <input maxLength={6} onInput={handleNumericInput} {...register("pincode", validationRules.pincode)} className={`w-full px-4 py-3 rounded-xl border outline-none ${errors.pincode ? "border-red-500 bg-red-50" : "border-slate-200"}`} />
                  {errors.pincode && <p className="text-red-500 text-xs font-bold">{errors.pincode.message}</p>}
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* PAYMENT METHOD SELECTOR                                         */}
            {/* User picks UPI/Razorpay OR Cash on Delivery                    */}
            {/* selectedPayment state tracks which card is active               */}
            {/* ============================================================== */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
              <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <CreditCard size={20} /> Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isActive = selectedPayment === method.value;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      id={`payment-method-${method.id}`}
                      onClick={() => setSelectedPayment(method.value)}
                      className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${isActive ? "border-green-500 bg-green-50 shadow-lg shadow-green-100" : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0 shadow-md`}>
                        <Icon size={22} color="white" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-black text-sm ${isActive ? "text-green-700" : "text-slate-800"}`}>{method.label}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{method.description}</p>
                      </div>
                      {/* Active checkmark */}
                      {isActive && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Info banners based on selected method */}
              {selectedPayment === "UPI" && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100">
                  <CreditCard size={18} className="text-violet-500 shrink-0" />
                  <p className="text-xs text-violet-700 font-medium">
                    Secure payment via <strong>Razorpay</strong>. Supports UPI, Debit/Credit Cards, Net Banking. Card details are never stored on our servers.
                  </p>
                </div>
              )}
              {selectedPayment === "COD" && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <Truck size={18} className="text-emerald-500 shrink-0" />
                  <p className="text-xs text-emerald-700 font-medium">Pay in <strong>cash</strong> when your order arrives. No online payment required.</p>
                </div>
              )}
            </div>

          </div>

          {/* ================================================================ */}
          {/* ORDER SUMMARY SIDEBAR (right column)                             */}
          {/* Shows subtotal, delivery charge, total, selected payment method  */}
          {/* Place Order button triggers form submit -> onSubmit()             */}
          {/* ================================================================ */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 h-fit sticky top-6">
              <h2 className="text-xl font-black text-slate-800 mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal</span>
                  <span>₹{finalTotalPrice}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Delivery Charge</span>
                  <span className="text-green-600 font-black">Free</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between text-slate-900">
                  <span className="font-black text-lg">Total</span>
                  <span className="font-black text-lg text-green-600">₹{finalTotalPrice}</span>
                </div>
                {/* Active payment method badge */}
                <div className="pt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Payment via</span>
                  <span className={`font-black px-2 py-1 rounded-lg text-xs ${selectedPayment === "COD" ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}`}>
                    {PAYMENT_METHODS.find((m) => m.value === selectedPayment)?.label || selectedPayment}
                  </span>
                </div>
              </div>

              {/* Submit button - label changes based on payment method */}
              <button
                type="submit"
                id="checkout-submit-btn"
                disabled={loading || items.length === 0}
                className="w-full mt-6 py-4 rounded-2xl bg-slate-900 text-white font-black text-lg hover:bg-green-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : selectedPayment === "COD"
                    ? "Place Order (COD)"
                    : `Pay ₹${finalTotalPrice} Now`}
              </button>

              <p className="text-center text-xs text-slate-400 font-medium mt-3">
                🔒 100% Secure &amp; Encrypted
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;