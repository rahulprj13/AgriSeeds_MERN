import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

const API_URL = "http://localhost:5000";

const Wishlist = () => {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const isLoggedIn = Boolean(user && (user._id || user.id));

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchWishlist = async () => {
    if (!isLoggedIn || !token) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const wishlistData =
        res?.data?.data || res?.data?.wishlist || res?.data || [];

      setItems(Array.isArray(wishlistData) ? wishlistData : []);
    } catch (e) {
      console.error("Wishlist fetch error:", e);
      toast.error(e?.response?.data?.message || "Failed to load wishlist");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token, isLoggedIn]);

  const handleRemove = async (productId) => {
    if (!productId) return;

    try {
      setUpdating(true);

      await axios.delete(`${API_URL}/api/wishlist/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Removed from wishlist");
      setItems((prev) => prev.filter((item) => item?.productId?._id !== productId));
    } catch (e) {
      console.error("Remove wishlist error:", e);
      toast.error(e?.response?.data?.message || "Failed to remove wishlist item");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddToCartFromWishlist = async (product) => {
    try {
      await addToCart(product);
      toast.success("Added to cart");
    } catch (e) {
      console.error("Add to cart error:", e);
      toast.error(e?.response?.data?.message || e?.message || "Add to cart failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-16 flex items-center justify-center">
        <p className="text-slate-600 font-bold text-lg">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <Heart className="text-red-500" size={20} fill="currentColor" />
            <div>
              <h1 className="text-2xl font-black text-slate-900">Wishlist</h1>
              <p className="text-sm text-slate-500 font-medium">
                {items.length} saved
              </p>
            </div>
          </div>
        </div>

        {!isLoggedIn ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center">
            <p className="text-slate-500 font-bold">Please login to view wishlist.</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700"
            >
              Login
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center">
            <p className="text-slate-500 font-bold">No products in wishlist.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700"
            >
              Browse products
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((w) => {
              const p = w?.productId;
              if (!p) return null;

              const imgSrc = p.imagePath
                ? p.imagePath.startsWith("http")
                  ? p.imagePath
                  : `${API_URL}/uploads/${p.imagePath}`
                : "https://placehold.co/400x400?text=No+Image";

              return (
                <div
                  key={p._id}
                  className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm"
                >
                  <div className="h-52 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center">
                    <img
                      src={imgSrc}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="mt-4">
                    <h3 className="font-black text-slate-900 line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      ₹{p.currentPrice ?? p.price}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleAddToCartFromWishlist(p)}
                      className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-2xl font-bold hover:bg-green-600 transition"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ShoppingCart size={18} />
                        Add to cart
                      </div>
                    </button>

                    <button
                      onClick={() => handleRemove(p._id)}
                      disabled={updating}
                      className="p-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition disabled:opacity-50"
                      title="Remove"
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
    </div>
  );
};

export default Wishlist;