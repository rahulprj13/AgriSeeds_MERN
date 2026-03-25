import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Plus, Minus, Trash2, ShoppingBag, MapPin, ArrowLeft } from "lucide-react";

const API_URL = "http://localhost:5000";

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

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useContext(AuthContext);
  const { cart, totalPrice: cartTotal, reloadCart, incrementQuantity, decrementQuantity, removeFromCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);

  // --- Buy Now Local State ---
  const isBuyNow = location.state?.isBuyNow;
  const buyNowProduct = location.state?.buyNowProduct;
  const [buyNowQty, setBuyNowQty] = useState(1);

  // In buy-now mode, max quantity should come from cart (so backend decrement won't fail)
  const buyNowCartItem = isBuyNow && buyNowProduct
    ? cart.find((ci) => {
      const pid = ci.productId?._id || ci.productId;
      return String(pid) === String(buyNowProduct._id);
    })
    : null;

  // Buy Now order will decrement quantity only from the cart item,
  // so frontend should not allow qty > cart item's qty.
  const buyNowMaxQty = isBuyNow ? Number(buyNowCartItem?.quantity ?? 1) : null;

  // Items Memoization
  const items = useMemo(() => {
    if (isBuyNow && buyNowProduct) {
      return [{ ...buyNowProduct, quantity: buyNowQty }];
    }
    return cart || [];
  }, [cart, isBuyNow, buyNowProduct, buyNowQty]);

  // Final Total Calculation
  const finalTotalPrice = useMemo(() => {
    if (isBuyNow && buyNowProduct) {
      return Number(buyNowProduct.currentPrice || buyNowProduct.price) * buyNowQty;
    }
    return cartTotal;
  }, [cartTotal, isBuyNow, buyNowProduct, buyNowQty]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: "onTouched",
    defaultValues: { country: "India" }
  });

  const handleNumericInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
  };

  // --- Updated Remove Logic with Message ---
  const handleRemoveItem = (itemId) => {
    const confirmRemoval = window.confirm("Are you sure you don't want to buy this product?");

    if (confirmRemoval) {
      if (isBuyNow) {
        toast.info("Buy Now cancelled");
        navigate(-1); // Vapas bhej dega
      } else {
        removeFromCart(itemId);
        toast.success("Item removed from checkout");
      }
    }
  };

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      if (isBuyNow) {
        const res = await axios.post(
          `${API_URL}/api/orders/buy-now`,
          {
            address: formData,
            productId: buyNowProduct?._id,
            quantity: buyNowQty,
          },
          { headers }
        );

        toast.success("Order placed successfully");
        if (typeof reloadCart === "function") await reloadCart();
        navigate(`/orders/${res.data.order._id}`);
      } else {
        const payload = { address: formData };
        const res = await axios.post(`${API_URL}/api/orders`, payload, { headers });
        toast.success("Order placed successfully");
        if (typeof reloadCart === "function") await reloadCart();
        navigate(`/orders/${res.data.order._id}`);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 pt-10">

        {/* BACK BUTTON */}
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

            {/* Items List */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
              <h2 className="text-xl font-black text-slate-800 mb-4">Order Items</h2>

              {items.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-center text-slate-500">
                  <ShoppingBag size={40} className="text-slate-300 mb-3" />
                  <p className="font-bold">Your checkout is empty.</p>
                  <button type="button" onClick={() => navigate("/")} className="mt-4 text-green-600 font-black underline">Continue Shopping</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const currentStock = Number(item.stock ?? 10);
                    const isOutOfStock = currentStock <= 0 || (item.status && item.status !== "active");
                    const canIncrement = isBuyNow
                      ? buyNowMaxQty != null
                        ? item.quantity < buyNowMaxQty
                        : item.quantity < currentStock
                      : !isOutOfStock && item.quantity < currentStock;

                    const itemImage = item.imagePath
                      ? (item.imagePath.startsWith("http") ? item.imagePath : `${API_URL}/uploads/${item.imagePath}`)
                      : "https://placehold.co/400x400?text=Product";

                    return (
                      <div
                        key={item._id || `${item.productId}-${item.name}`}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-100 rounded-2xl p-4"
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          {/* Image with Link */}
                          <div
                             onClick={() => navigate(`/category/${item.productId?.categoryId.name}/${item.productId.name}/${item.productId?._id}`)}
                            className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:border-indigo-500 transition-all group"
                          >
                            <img
                              src={itemImage}
                              alt={item.name}
                              className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          <div>
                            {/* Name with Link */}
                            <p
                              onClick={() => navigate(`/category/${item.productId?.categoryId.name}/${item.productId.name}/${item.productId?._id}`)}
                              className="font-black text-slate-900 cursor-pointer hover:text-green-600 transition-colors"
                            >
                              {item.name}
                            </p>

                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                              {item.weight} {item.unit}
                            </p>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                              Price: ₹{item.currentPrice ?? item.price}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                if (isBuyNow) {
                                  setBuyNowQty(prev => Math.max(1, prev - 1));
                                } else {
                                  decrementQuantity(item._id, item.quantity);
                                }
                              }}
                              className="p-2 hover:bg-white hover:text-red-500 rounded-lg transition-all"
                              disabled={isOutOfStock || item.quantity <= 1}
                            >
                              <Minus size={16} strokeWidth={3} />
                            </button>
                            <span className="w-10 text-center font-black text-slate-800">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (isBuyNow) {
                                  setBuyNowQty(prev => (prev < (buyNowMaxQty ?? currentStock) ? prev + 1 : prev));
                                } else {
                                  canIncrement && incrementQuantity(item._id, item.quantity);
                                }
                              }}
                              className="p-2 hover:bg-white hover:text-green-600 rounded-lg transition-all disabled:opacity-30"
                              disabled={!canIncrement}
                            >
                              <Plus size={16} strokeWidth={3} />
                            </button>
                          </div>

                          <div className="text-right min-w-20">
                            <p className="font-black text-slate-900">
                              ₹{(item.currentPrice ?? item.price) * item.quantity}
                            </p>
                            <p className="text-xs text-slate-500 font-bold">
                              ₹{item.currentPrice ?? item.price} / unit
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item._id)}
                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Address Form */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <MapPin size={20} /> Delivery Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ... (Baki fields same hain) ... */}
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
                  <label className="text-sm font-bold text-slate-600">Address Line 2 *</label>
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
          </div>

          {/* Right Summary Sidebar */}
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
              </div>
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full mt-6 py-4 rounded-2xl bg-slate-900 text-white font-black text-lg hover:bg-green-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Placing order..." : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;