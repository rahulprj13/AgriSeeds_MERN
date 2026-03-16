import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import {
  ArrowLeft,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  Leaf,
  Droplets,
  Maximize
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
    window.scrollTo(0, 0); // Scroll to top on component mount
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found 😢</h2>
        <button onClick={() => navigate("/")} className="mt-4 text-green-600 font-semibold flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Shop
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }
    addToCart(product);
    // Success feedback (optional)
    alert("Added to cart!");
  };

  const productImage = product.imagePath
    ? (product.imagePath.startsWith('http') ? product.imagePath : `${API_URL}/uploads/${product.imagePath}`)
    : "https://placehold.co/600x600?text=No+Image";

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Navbar space and Back Button */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors font-medium"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">

            {/* --- LEFT: IMAGE SECTION --- */}
            <div className="p-8 bg-slate-100/50 flex items-center justify-center relative">
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  Organic
                </span>
                <span className="bg-white text-slate-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm border border-slate-100">
                  {product.weight} {product.unit}
                </span>
              </div>
              <img
                src={productImage}
                alt={product.name}
                className="w-full max-h-125 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* --- RIGHT: CONTENT SECTION --- */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 lowercase first-letter:uppercase">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl font-black text-green-600">₹{product.price}</span>
                {product.discountPrice && (
                  <span className="text-xl text-slate-300 line-through font-bold">₹{product.discountPrice}</span>
                )}
              </div>

              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                {product.description || "Premium quality seeds with high germination rate. Perfect for modern farming and home gardens."}
              </p>

              

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 bg-slate-900 text-white h-16 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-green-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
                >
                  <ShoppingCart size={22} />
                  Add to Cart
                </button>
                <button
                  className="flex-1 bg-green-600 text-white h-16 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-green-700 transition-all active:scale-95 shadow-xl shadow-green-100"
                >
                  <Zap size={22} fill="currentColor" />
                  Buy Now
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex items-center gap-6 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                  <ShieldCheck size={16} className="text-green-600" /> Secure Payment
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                  <Truck size={16} className="text-blue-500" /> Fast Delivery
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