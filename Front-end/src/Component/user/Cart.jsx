import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  BadgeCheck,
  Truck,
  Tag,
} from "lucide-react";
import { toast } from "react-toastify";
import { CartContext } from "../context/CartContext";
import { CategoryContext } from "../context/CategoryContext";

const API_URL = "http://localhost:5000";

const Cart = () => {
  const { category } = useContext(CategoryContext);
  const {
    cart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    totalPrice,
  } = useContext(CartContext);

  const navigate = useNavigate();

  const [confirmBox, setConfirmBox] = useState({
    open: false,
    itemId: null,
    itemName: "",
  });

  const checkAvailability = (item) => {
    const isOutOfStock = Number(item.stock) <= 0;
    const isInactive = item.status && item.status !== "active";
    return isOutOfStock || isInactive;
  };

  const hasInvalidItems = cart.some((item) => checkAvailability(item));

  const openRemoveConfirm = (itemId, itemName) => {
    setConfirmBox({
      open: true,
      itemId,
      itemName,
    });
  };

  const closeRemoveConfirm = () => {
    setConfirmBox({
      open: false,
      itemId: null,
      itemName: "",
    });
  };

  const confirmRemoveItem = () => {
    if (!confirmBox.itemId) return;
    removeFromCart(confirmBox.itemId);
    closeRemoveConfirm();
    toast.success("Item removed from cart");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] px-4 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <ShoppingBag className="text-green-600" size={30} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="mt-2 text-sm text-slate-500">
            Add products to your cart and continue shopping.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 w-full rounded-xl bg-[#18ba30] px-6 py-3 font-semibold text-white hover:bg-[#1fd340] transition"
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f1f3f6] pb-10">
        <div className="max-w-7xl mx-auto px-4 pt-6">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#2874f0] transition"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Cart</h1>
                <p className="text-sm text-slate-500">
                  {cart.length} item{cart.length > 1 ? "s" : ""} in your cart
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const currentStock = Number(item.stock);
                const isUnavailable =
                  (item.status && item.status !== "active") || currentStock <= 0;

                const productId = item.productId?._id || item.productId;
                const categorySlug = (item.productId?.categoryId?.name || "seeds")
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                const productNameSlug = (item.productId?.name || item.name || "")
                  .toLowerCase()
                  .replace(/\s+/g, "-");

                const itemImage = item.imagePath
                  ? item.imagePath.startsWith("http")
                    ? item.imagePath
                    : `${API_URL}/uploads/${item.imagePath}`
                  : "https://placehold.co/400x400?text=Product";

                return (
                  <div
                    key={item._id}
                    className={`rounded-2xl border bg-white p-4 transition ${
                      isUnavailable
                        ? "border-red-200"
                        : "border-slate-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image */}
                      <div
                        onClick={() => {
                          if (!productId || isUnavailable) return;
                          navigate(`/category/${categorySlug}/${productNameSlug}/${productId}`);
                        }}
                        className={`h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl overflow-hidden border cursor-pointer ${
                          isUnavailable
                            ? "border-red-100 bg-red-50 grayscale opacity-60"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <img
                          src={itemImage}
                          alt={item.name}
                          className="h-full w-full object-contain p-2"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2
                              onClick={() => {
                                if (isUnavailable || !productId) return;
                                navigate(`/category/${categorySlug}/${productNameSlug}/${productId}`);
                              }}
                              className={`text-base md:text-lg font-semibold leading-snug ${
                                isUnavailable
                                  ? "text-slate-400"
                                  : "text-slate-900 hover:text-[#2874f0] cursor-pointer"
                              }`}
                            >
                              {item.name}
                            </h2>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="text-xs text-slate-500 font-medium">
                                {item.weight} {item.unit}
                              </span>

                              {!isUnavailable ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-600">
                                  <BadgeCheck size={11} />
                                  Available
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-600">
                                  <AlertCircle size={11} />
                                  Unavailable
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => openRemoveConfirm(item._id, item.name)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition"
                            title="Remove Item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                          <div>
                            <p
                              className={`text-xl md:text-2xl font-bold ${
                                isUnavailable ? "text-slate-300 line-through" : "text-slate-900"
                              }`}
                            >
                              ₹{item.currentPrice * item.quantity}
                            </p>
                            <p className="text-xs text-slate-800 mt-1">
                              ₹{item.currentPrice} per unit
                            </p>
                          </div>

                          {isUnavailable ? (
                            <div className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                              <AlertCircle size={14} />
                              Out of Stock / Unavailable
                            </div>
                          ) : (
                            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                              <button
                                onClick={() => decrementQuantity(item._id, item.quantity)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-white hover:text-red-500 transition"
                              >
                                <Minus size={15} strokeWidth={3} />
                              </button>

                              <span className="w-10 text-center text-base font-bold text-slate-900">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() => {
                                  if (currentStock <= 0) {
                                    toast.error("Product is out of stock");
                                    return;
                                  }

                                  if (item.quantity >= currentStock) {
                                    toast.warning(`Only ${currentStock} stock available`);
                                    return;
                                  }

                                  incrementQuantity(item._id, item.quantity);
                                }}
                                disabled={isUnavailable}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-white hover:text-green-600 transition disabled:opacity-40"
                              >
                                <Plus size={15} strokeWidth={3} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                  <h2 className="text-lg font-bold text-slate-700">PRICE DETAILS</h2>
                </div>

                <div className="p-5">
                  {hasInvalidItems && (
                    <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                      <div className="flex gap-2">
                        <AlertCircle className="shrink-0 mt-0.5" size={16} />
                        <p>Please remove unavailable items to continue.</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Price ({cart.length} items)</span>
                      <span className="font-semibold text-slate-900">₹{totalPrice}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Delivery Charges</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>Platform Fee</span>
                      <span className="font-semibold text-slate-900">₹0</span>
                    </div>

                    <div className="border-t border-dashed border-slate-200 pt-4 flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">Total Amount</span>
                      <span className="text-2xl font-bold text-slate-900">₹{totalPrice}</span>
                    </div>
                  </div>

                  <button
                    disabled={hasInvalidItems}
                    onClick={() => navigate("/checkout")}
                    className={`mt-6 w-full rounded-xl py-3.5 text-base font-semibold transition ${
                      hasInvalidItems
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-[#fb641b] text-white hover:bg-[#e85a16]"
                    }`}
                  >
                    {hasInvalidItems ? "Check Items Again" : "Place Order"}
                  </button>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <ShieldCheck size={17} className="text-green-600" />
                      <span className="font-medium">Secure payment</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Truck size={17} className="text-slate-600" />
                      <span className="font-medium">Fast delivery available</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Tag size={17} className="text-blue-600" />
                      <span className="font-medium">Best price on selected items</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Confirm Popup */}
      {confirmBox.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-[fadeIn_.2s_ease]">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 px-5 py-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Remove Item</h3>
                  <p className="text-xs text-slate-500">Please confirm your action</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-slate-900">
                  {confirmBox.itemName || "this item"}
                </span>{" "}
                from your cart?
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={closeRemoveConfirm}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmRemoveItem}
                  className="rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 transition"
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;