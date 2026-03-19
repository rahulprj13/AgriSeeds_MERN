import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
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

    
    // const categoryName = product.categoryId?.name?.toLowerCase() || "seeds";
    // const productName = product.name?.toLowerCase().replace(/\s+/g, '-');

  // 1. Redirect if not logged in (Using useEffect to avoid double toast)
  // useEffect(() => {
  //   if (!user) {
  //     toast.info("Please login to view your cart", { toastId: "auth-check" });
  //     navigate("/login");
  //   }
  // }, [user, navigate]);


  
  const checkAvailability = (item) => {
    const isOutOfStock = Number(item.stock) <= 0;
    const isInactive = item.status && item.status !== "active";
    return isOutOfStock || isInactive;
  };
  
  const hasInvalidItems = cart.some(item => checkAvailability(item));

  // Loading state if user is being redirected
  // if (!user) return null;

  // 3. Empty Cart UI
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 px-4">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 text-center max-w-md">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-slate-300" size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">Your cart is empty</h1>
          <p className="text-slate-400 font-medium mb-8">Looks like you haven't added anything to your cart yet.</p>
          <button 
            onClick={() => navigate("/")} 
            className="w-full bg-green-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-green-700 transition-all active:scale-95 shadow-xl shadow-green-100"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm hover:text-green-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            My Cart <span className="text-green-600 text-lg">({cart.length} items)</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* --- LEFT: CART ITEMS LIST --- */}
          <div className="lg:col-span-2 space-y-4">

            {cart.map((item) => {
              
              const currentStock = Number(item.stock);
              const isUnavailable = (item.status && item.status !== "active") || currentStock <= 0;
              const productId = item.productId?._id || item.productId;
              const categorySlug = (item.productId?.categoryId?.name || "seeds")
                .toLowerCase();
              const productNameSlug = (item.productId?.name || item.name || "")
                .toLowerCase()
                .replace(/\s+/g, "-");
              
              const itemImage = item.imagePath
                ? (item.imagePath.startsWith('http') ? item.imagePath : `${API_URL}/uploads/${item.imagePath}`)
                : "https://placehold.co/400x400?text=Product";

              return (
                <div
                  key={item._id}
                  className={`bg-white p-5 rounded-4xl border transition-all flex flex-col sm:flex-row gap-6 items-center group relative ${
                    isUnavailable ? "border-red-200 bg-red-50/40" : "border-slate-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Product Image */}
                  <div className={`relative w-32 h-32 rounded-2xl overflow-hidden shrink-0 ${isUnavailable ? "grayscale opacity-50" : "bg-slate-50"}`}>
                    <img 
                      src={itemImage} 
                      alt={item.name} 
                      className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
                      onClick={() => {
                        if (!productId) return;
                        navigate(`/category/${categorySlug}/${productNameSlug}/${productId}`);
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className={`text-xl font-black transition-colors ${isUnavailable ? "text-slate-400" : "text-slate-800 hover:text-green-600 cursor-pointer"}`}
                        onClick={() => {
                          if (isUnavailable) return;
                          if (!productId) return;
                          navigate(`/category/${categorySlug}/${productNameSlug}/${productId}`);
                        }}>
                      {item.name}
                      
                    </h2>
                    <p className="text-slate-600 text-sm font-bold uppercase tracking-widest mt-1">
                      {item.weight} {item.unit}
                    </p>

                    {/* Conditional Rendering for Availability */}
                    {isUnavailable ? (
                      <div className="flex items-center gap-2 mt-4 text-red-600 font-bold text-xs bg-red-100/50 w-fit px-3 py-1.5 rounded-lg border border-red-100">
                        <AlertCircle size={14} /> Out of Stock / Unavailable
                      </div>
                    ) : (
                      <div className="flex items-center justify-center sm:justify-start mt-4 bg-slate-50 w-fit rounded-xl p-1 border border-slate-100">
                        <button 
                          onClick={() => decrementQuantity(item._id, item.quantity)} 
                          className="p-2 hover:bg-white hover:text-red-500 rounded-lg transition-all"
                        >
                          <Minus size={16} strokeWidth={3} />
                        </button>
                        <span className="w-10 text-center font-black text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => incrementQuantity(item._id, item.quantity)}
                          disabled={item.quantity >= currentStock}
                          className="p-2 hover:bg-white hover:text-green-600 rounded-lg disabled:opacity-20 transition-all"
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price & Remove Action */}
                  <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                    <div className="text-right">
                      <p className={`text-2xl font-black ${isUnavailable ? "text-slate-300 line-through" : "text-slate-900"}`}>
                        ₹{item.currentPrice * item.quantity}
                      </p>
                      <p className="text-xs font-bold text-slate-400">₹{item.currentPrice} /per unit</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item._id)} 
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                      title="Remove Item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- RIGHT: ORDER SUMMARY --- */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-10">
              <h2 className="text-2xl font-black text-slate-800 mb-6">Order Summary</h2>

              {/* Error Message for Unavailable Items */}
              {hasInvalidItems && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 text-sm font-medium animate-pulse">
                  <AlertCircle className="shrink-0" size={20} />
                  <p>Please remove unavailable items to continue with your purchase.</p>
                </div>
              )}

              {/* Billing Details */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-slate-800 font-bold">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Delivery Charge</span>
                  <span className="text-green-600 font-bold uppercase text-xs bg-green-50 px-2 py-1 rounded">Free</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-800">Total Amount</span>
                  <span className="text-3xl font-black text-green-600">₹{totalPrice}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                disabled={hasInvalidItems}
                onClick={() => navigate("/checkout")}
                className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${
                  hasInvalidItems
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-slate-900 text-white hover:bg-green-600 shadow-slate-200"
                }`}
              >
                {hasInvalidItems ? "Check Items Again" : "Checkout Now"}
              </button>

              {/* Trust Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                <ShieldCheck size={16} />
                <span className="text-[10px] uppercase font-bold tracking-widest">Secure Encrypted Payment</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;  