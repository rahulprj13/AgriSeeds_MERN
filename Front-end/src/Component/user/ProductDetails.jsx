import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  IndianRupee,
  Star,
  Clock,
  CheckCircle2
} from "lucide-react";

const API_URL = "http://localhost:5000";

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/products/${id}`);
        setProduct(res.data);
      } catch (e) {
        console.error("Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="text-center py-20 font-bold">Product Not Found</div>;

  // --- DISCOUNT CALCULATION ---
  const sellerPrice = Number(product.currentPrice) || 0;
    const Price = Number(product.price) || 0;
    
    const discountPercent = (sellerPrice > 0 && sellerPrice !== Price)
        ? Math.round((Math.abs(sellerPrice - Price) / Math.max(sellerPrice, Price)) * 100)
        : 0;

  const productImage = product.imagePath
    ? (product.imagePath.startsWith('http') ? product.imagePath : `${API_URL}/uploads/${product.imagePath}`)
    : "https://placehold.co/600x600?text=No+Image";

  const handleAddToCart = async () => {
    if (!user) {
      toast.info("Please login first");
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    try {
      await addToCart(product);
      toast.success("Added to cart");
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Add to cart failed");
    }
  };

  return (
    <div className="bg-[#fcfdfd] min-h-screen pb-20 font-sans selection:bg-green-100">
      
      {/* --- BREADCRUMB / NAVIGATION --- */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-400 hover:text-green-600 transition-all font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Shop
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-10">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            
            {/* --- LEFT: VISUALS SECTION --- 
                Humein isse background layer banana hai isliye z-0 use kiya hai.
            */}
            <div className="p-6 md:p-12 bg-slate-50/50 flex items-center justify-center relative border-r border-slate-50 overflow-hidden">
              
              {/* Promotional Badges */}
              <div className="absolute top-10 left-10 flex flex-col gap-3 z-20">
                {discountPercent > 0 && (
                  <div className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[11px] font-black tracking-tighter shadow-lg shadow-red-200 animate-bounce">
                    SAVE {discountPercent}% OFF
                  </div>
                )}
                <div className="bg-white/90 backdrop-blur-md text-slate-800 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest border border-slate-100 shadow-sm uppercase">
                  {product.weight} {product.unit}
                </div>
              </div>

              {/* Product Image Wrapper */}
              <div className="relative group">
                {/* Background Glow - Fixed with z-0 to stay behind image */}
                <div className="absolute inset-0 bg-green-200 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity z-0 pointer-events-none"></div>
                
                <img
                  src={productImage}
                  alt={product.name}
                  // z-0 ensures it stays below the content during any responsive shifts
                  className="relative z-0 w-full max-w-[450px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            {/* --- RIGHT: DETAILS SECTION --- 
                z-10 ensures this content stays on top of the image layer.
            */}
            <div className="p-8 md:p-16 flex flex-col relative z-10 bg-white lg:bg-transparent">
              
              {/* Product Trust Signals */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Premium Quality</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6 capitalize tracking-tight">
                {product.name}
              </h1>

              {/* Pricing Module */}
              <div className="bg-slate-50 p-6 rounded-[2rem] inline-flex items-center gap-6 mb-8 border border-slate-100 w-fit">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Price</span>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black text-green-600 flex items-center">
                      <IndianRupee size={28} strokeWidth={3} />{sellerPrice}
                    </span>
                    {Price > sellerPrice && (
                      <span className="text-xl text-slate-300 line-through font-bold">₹{Price}</span>
                    )}
                  </div>
                </div>
                
                {discountPercent > 0 && (
                  <>
                    <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Discount</span>
                      <span className="text-xl font-black text-red-500">{discountPercent}%</span>
                    </div>
                  </>
                )}
              </div>

              {/* Description Body */}
              <p className="text-slate-500 text-lg leading-relaxed mb-10 font-medium max-w-lg">
                {product.description || "Handpicked premium selection ensuring maximum freshness and superior quality for your daily needs."}
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <CheckCircle2 size={18} className="text-green-500" /> 100% Organic
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <Clock size={18} className="text-blue-500" /> Fast Shipping
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-[1.5] bg-slate-900 text-white h-20 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                  <ShoppingCart size={24} /> Add to Cart
                </button>
                <button className="flex-1 bg-green-50 text-green-700 h-20 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-green-100 transition-all active:scale-95">
                  <Zap size={24} fill="currentColor" /> Buy Now
                </button>
              </div>

              {/* Footer Trust Badges */}
              <div className="pt-8 border-t border-slate-100 flex flex-wrap gap-8">
                <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <Truck size={20} className="text-slate-500" /> Free Shipping
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <CheckCircle2 size={20} className="text-green-500" /> Secure Checkout
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;