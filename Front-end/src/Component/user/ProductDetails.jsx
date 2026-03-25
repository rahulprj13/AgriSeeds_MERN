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
  CheckCircle2,
  Heart,
  MessageSquare
} from "lucide-react";

const API_URL = "http://localhost:5000";

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const { addToCart, cart, incrementQuantity, decrementQuantity, removeFromCart } = useContext(CartContext);

  const [product, setProduct] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  const [reviewSummary, setReviewSummary] = useState({ avgRating: 0, count: 0 });
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  const userId = user?._id || user?.id || null;

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

  // helper: find cart item for this product
  const cartItem = cart.find((item) => {
    const pid = item.productId?._id || item.productId;
    return String(pid) === String(product._id);
  });

  const reviewRating = Number(reviewForm.rating);
  const isReviewValid =
    Boolean(userId && token) &&
    Number.isFinite(reviewRating) &&
    reviewRating >= 1 &&
    reviewRating <= 5 &&
    Boolean(reviewForm.title?.trim()) &&
    Boolean(reviewForm.comment?.trim());

  const fetchReviewsAndSummary = async () => {
    if (!product?._id) return;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const summaryRes = await axios.get(
        `${API_URL}/api/products/${product._id}/reviews/summary`,
        { headers }
      );
      const summary = summaryRes.data?.data || { avgRating: 0, count: 0 };
      setReviewSummary({
        avgRating: Number(summary.avgRating ?? 0),
        count: Number(summary.count ?? 0),
      });

      const listRes = await axios.get(
        `${API_URL}/api/products/${product._id}/reviews`,
        { headers }
      );
      const list = Array.isArray(listRes.data?.data) ? listRes.data.data : [];
      setReviews(list);

      if (userId) {
        const mine = list.find((r) => String(r.userId?._id || r.userId) === String(userId)) || null;
        setMyReview(mine);
        if (mine) {
          setReviewForm({
            rating: Number(mine.rating ?? 5),
            title: mine.title || "",
            comment: mine.comment || "",
          });
        } else {
          setReviewForm((p) => ({ ...p, rating: 5, title: "", comment: "" }));
        }
      } else {
        setMyReview(null);
      }
    } catch (e) {
      console.log("REVIEW_FETCH_ERROR", e?.message || e);
    }
  };

  const fetchWishlistState = async () => {
    if (!product?._id) return;
    if (!userId || !token) {
      setIsWishlisted(false);
      return;
    }
    try {
      setWishlistLoading(true);
      const res = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      const wish = items.some((w) => String(w.productId?._id || w.productId) === String(product._id));
      setIsWishlisted(wish);
    } catch (e) {
      console.log("WISHLIST_FETCH_ERROR", e?.message || e);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!userId || !token) {
      toast.info("Please login first");
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }
    try {
      setWishlistLoading(true);
      if (isWishlisted) {
        await axios.delete(`${API_URL}/api/wishlist/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await axios.post(
          `${API_URL}/api/wishlist/${product._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsWishlisted(true);
        toast.success("Saved to wishlist");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Wishlist failed");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSaveReview = async () => {
    if (!userId || !token) {
      toast.info("Please login first");
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    const rating = Number(reviewForm.rating);
    const title = reviewForm.title?.trim();
    const comment = reviewForm.comment?.trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }
    if (!title) {
      toast.error("Please add a title");
      return;
    }
    if (!comment) {
      toast.error("Please write your review comment");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/products/${product._id}/reviews`,
        { rating, title, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Review saved");
      await fetchReviewsAndSummary();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Review failed");
    }
  };

  const handleDeleteMyReview = async () => {
    if (!myReview?._id) return;
    try {
      setWishlistLoading(true);
      await axios.delete(
        `${API_URL}/api/products/${product._id}/reviews/${myReview._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Review deleted");
      await fetchReviewsAndSummary();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Delete failed");
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsAndSummary();
    fetchWishlistState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id, userId, token]);

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
                  className="relative z-0 w-full max-w-112.5 object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            
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
              <div className="bg-slate-50 p-6 rounded-4xl inline-flex items-center gap-6 mb-8 border border-slate-100 w-fit">
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
                    <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block"></div>
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
              <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center">
                {cartItem ? (
                  <div className="flex items-center gap-3 bg-slate-50 rounded-3xl p-3">
                    <button
                      onClick={() => decrementQuantity(cartItem._id, cartItem.quantity)}
                      className="px-3 py-2 rounded-lg bg-white/80 hover:bg-white"
                    >
                      -
                    </button>
                    <div className="px-4 py-2 font-black text-lg">{cartItem.quantity}</div>
                    <button
                      onClick={() => incrementQuantity(cartItem._id, cartItem.quantity)}
                      className="px-3 py-2 rounded-lg bg-white/80 hover:bg-white"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(cartItem._id)}
                      className="ml-3 px-3 py-2 rounded-lg bg-rose-50 text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-[1.5] bg-slate-900 text-white h-16 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    <ShoppingCart size={20} /> Add to Cart
                  </button>
                )}

                <button
                  onClick={async () => {
                    if (!user) {
                      toast.info("Please login first");
                      navigate("/login", { replace: true, state: { from: location.pathname } });
                      return;
                    }

                    try {
                      // if not in cart, add it
                      if (!cartItem) {
                        await addToCart(product);
                        toast.success("Added to cart");
                      }
                      // navigate to checkout (single-item view) where user can fill address
                      navigate("/checkout", {
                        state: { isBuyNow: true, buyNowProduct: product },
                      });
                    } catch (e) {
                      toast.error(e?.response?.data?.message || e?.message || "Buy Now failed");
                    }
                  }}
                  className="flex-1 bg-green-50 text-green-700 h-16 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-green-100 transition-all active:scale-95"
                >
                  <Zap size={20} fill="currentColor" /> Buy Now
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
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 disabled:opacity-50"
                >
                  <Heart size={16} className={isWishlisted ? "text-red-500 fill-red-500" : "text-slate-700"} />
                  {isWishlisted ? "Wishlisted" : "Save for later"}
                </button>
              </div>

              {/* Reviews */}
              <div className="mt-8">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Customer Reviews</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-2xl font-black text-slate-900">
                        {reviewSummary.count ? reviewSummary.avgRating.toFixed(1) : "0.0"}
                      </span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={16}
                            fill={n <= Math.round(reviewSummary.avgRating) ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-500 font-bold">
                        {reviewSummary.count} review{reviewSummary.count === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 text-slate-500 font-medium">
                      No reviews yet. Be the first!
                    </div>
                  ) : (
                    reviews.slice(0, 5).map((r) => (
                      <div key={r._id} className="bg-white border border-slate-100 rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Star
                                    key={n}
                                    size={14}
                                    fill={n <= (r.rating || 0) ? "currentColor" : "none"}
                                  />
                                ))}
                              </div>
                              <p className="font-black text-slate-900">{r.title || "Review"}</p>
                            </div>
                            <p className="mt-2 text-slate-600 text-sm leading-relaxed">{r.comment}</p>
                            <p className="mt-3 text-xs text-slate-400 font-bold">
                              {r.userName ? `By ${r.userName}` : "User"}{" "}
                              {r.createdAt ? `• ${new Date(r.createdAt).toLocaleDateString()}` : ""}
                            </p>
                          </div>
                          {myReview?._id === r._id && (
                            <button
                              type="button"
                              onClick={handleDeleteMyReview}
                              className="text-red-500 hover:text-red-700 text-xs font-bold"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 bg-white border border-slate-100 rounded-3xl p-5">
                  <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-2">
                    <MessageSquare size={18} /> {myReview ? "Update your review" : "Write a review"}
                  </h3>
                  {!userId ? (
                    <p className="text-slate-500 font-medium">Login to write a review.</p>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-slate-600">Rating *</label>
                        <div className="flex items-center gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setReviewForm((p) => ({ ...p, rating: n }))}
                              className="text-amber-400 hover:opacity-90"
                            >
                              <Star size={20} fill={n <= Number(reviewForm.rating) ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-600">Title *</label>
                        <input
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                          placeholder="Example: Great quality!"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-600">Comment *</label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none min-h-24"
                          placeholder="Write your review..."
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveReview}
                        disabled={!isReviewValid}
                        className={`px-6 py-3 rounded-xl font-bold transition ${
                          isReviewValid
                            ? "bg-slate-900 text-white hover:bg-green-600"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        {myReview ? "Save changes" : "Submit review"}
                      </button>
                    </div>
                  )}
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