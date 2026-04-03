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
  Truck,
  IndianRupee,
  Star,
  Clock,
  CheckCircle2,
  Heart,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

const API_URL = "http://localhost:5000";

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const { addToCart, cart, incrementQuantity, decrementQuantity, removeFromCart } =
    useContext(CartContext);

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

  const sellerPrice = Number(product?.currentPrice) || 0;
  const Price = Number(product?.price) || 0;

  const discountPercent =
    sellerPrice > 0 && sellerPrice !== Price
      ? Math.round((Math.abs(sellerPrice - Price) / Math.max(sellerPrice, Price)) * 100)
      : 0;

  const productImage = product?.imagePath
    ? product.imagePath.startsWith("http")
      ? product.imagePath
      : `${API_URL}/uploads/${product.imagePath}`
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

  const cartItem = cart.find((item) => {
    const pid = item.productId?._id || item.productId;
    return String(pid) === String(product?._id);
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

      const listRes = await axios.get(`${API_URL}/api/products/${product._id}/reviews`, {
        headers,
      });
      const list = Array.isArray(listRes.data?.data) ? listRes.data.data : [];
      setReviews(list);

      if (userId) {
        const mine =
          list.find((r) => String(r.userId?._id || r.userId) === String(userId)) || null;
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
      const wish = items.some(
        (w) => String(w.productId?._id || w.productId) === String(product._id)
      );
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
      await axios.delete(`${API_URL}/api/products/${product._id}/reviews/${myReview._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-green-50 to-emerald-100">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="text-center py-20 font-bold">Product Not Found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fffb] via-white to-[#eefbf3] pb-20 font-sans selection:bg-green-100 selection:text-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-green-600 transition-all font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_25px_80px_rgba(16,24,40,0.08)]">
          <div className="grid lg:grid-cols-2">
            <div className="relative flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6 md:p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-slate-100 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 h-24 w-24 rounded-full bg-green-200/40 blur-3xl"></div>
                <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl"></div>
              </div>

              <div className="absolute top-6 left-6 flex flex-col gap-3 z-20">
                {discountPercent > 0 && (
                  <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-full text-[11px] font-black tracking-wider shadow-lg">
                    SAVE {discountPercent}% OFF
                  </div>
                )}

                <div className="bg-white/90 backdrop-blur-md text-slate-800 px-4 py-2 rounded-full text-[11px] font-black tracking-widest border border-slate-100 shadow-sm uppercase">
                  {product.weight} {product.unit}
                </div>
              </div>

              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`absolute top-6 right-6 z-20 h-12 w-12 rounded-full border shadow-lg backdrop-blur-md flex items-center justify-center transition-all duration-300 ${isWishlisted
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "bg-white/90 border-slate-200 text-slate-600 hover:bg-white hover:text-red-500"
                  } disabled:opacity-60`}
              >
                <Heart
                  size={20}
                  className={isWishlisted ? "fill-red-500 text-red-500" : ""}
                />
              </button>

              <div className="relative group w-full max-w-xl">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-green-100 via-transparent to-emerald-100 blur-3xl opacity-70 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative rounded-[2rem] bg-white/80 border border-white shadow-xl p-6 md:p-10">
                  <img
                    src={productImage}
                    alt={product.name}
                    className="w-full h-[320px] md:h-[430px] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10 lg:p-14 bg-white">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-600 border border-amber-100">
                  <Star size={13} fill="currentColor" />
                  Premium Quality
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-green-600 border border-green-100">
                  <ShieldCheck size={13} />
                  Trusted Product
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight capitalize tracking-tight">
                {product.name}
              </h1>

              <p className="mt-5 text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl">
                {product.description ||
                  "Handpicked premium selection ensuring maximum freshness and superior quality for your daily needs."}
              </p>

              <div className="mt-8 inline-flex flex-wrap items-center gap-5 rounded-[1.8rem] bg-gradient-to-r from-slate-50 to-green-50 p-5 md:p-6 border border-slate-100 shadow-sm">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                    Current Price
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl md:text-4xl font-black text-green-600 flex items-center">
                      <IndianRupee size={26} strokeWidth={3} />
                      {sellerPrice}
                    </span>
                    {Price > sellerPrice && (
                      <span className="text-lg md:text-xl text-slate-300 line-through font-bold">
                        ₹{Price}
                      </span>
                    )}
                  </div>
                </div>

                {discountPercent > 0 && (
                  <>
                    <div className="hidden sm:block h-12 w-px bg-slate-200"></div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400 mb-1">
                        Discount
                      </p>
                      <p className="text-2xl font-black text-red-500">{discountPercent}%</p>
                    </div>
                  </>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mt-8">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <CheckCircle2 size={18} className="text-green-500" />
                    100% Organic
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Clock size={18} className="text-blue-500" />
                    Fast Shipping
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Truck size={18} className="text-slate-600" />
                    Fresh Delivery
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {cartItem ? (
                  <div className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-[1.5rem] p-3 border border-slate-100">
                    <button
                      onClick={() => decrementQuantity(cartItem._id, cartItem.quantity)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 font-bold shadow-sm"
                    >
                      -
                    </button>
                    <div className="px-4 py-2 font-black text-lg text-slate-900">
                      {cartItem.quantity}
                    </div>
                    <button
                      onClick={() => incrementQuantity(cartItem._id, cartItem.quantity )}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 font-bold shadow-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(cartItem._id)}
                      className="ml-0 sm:ml-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-slate-900 text-white min-h-[58px] rounded-[1.25rem] font-black text-base md:text-lg flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-lg active:scale-[0.98]"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                )}

                {/* <button
                  onClick={async () => {
                    if (!user) {
                      toast.info("Please login first");
                      navigate("/login", { replace: true, state: { from: location.pathname } });
                      return;
                    }

                    try {
                      if (!cartItem) {
                        await addToCart(product);
                        toast.success("Added to cart");
                      }

                      navigate("/checkout", {
                        state: { isBuyNow: true, buyNowProduct: product },
                      });
                    } catch (e) {
                      toast.error(e?.response?.data?.message || e?.message || "Buy Now failed");
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white min-h-[58px] rounded-[1.25rem] font-black text-base md:text-lg flex items-center justify-center gap-3 hover:opacity-95 transition-all shadow-lg active:scale-[0.98]"
                >
                  <Zap size={20} fill="currentColor" />
                  Buy Now
                </button> */}



                <button
                  onClick={async () => {
                    if (!user) {
                      toast.info("Please login first");
                      navigate("/login", { replace: true, state: { from: location.pathname } });
                      return;
                    }

                    try {
                      if (!cartItem) {
                        await addToCart(product);
                        toast.success("Added to cart");
                      }

                      navigate("/checkout", {
                        state: {
                          isBuyNow: true,
                          buyNowProduct: {
                            ...product,
                            quantity: 1,
                          },
                        },
                      });
                    } catch (e) {
                      toast.error(e?.response?.data?.message || e?.message || "Buy Now failed");
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white min-h-[58px] rounded-[1.25rem] font-black text-base md:text-lg flex items-center justify-center gap-3 hover:opacity-95 transition-all shadow-lg active:scale-[0.98]"
                >
                  <Zap size={20} fill="currentColor" />
                  Buy Now
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4 md:gap-6">
                <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-4 py-3 rounded-xl">
                  <Truck size={18} className="text-slate-500" />
                  Free Shipping
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-4 py-3 rounded-xl">
                  <CheckCircle2 size={18} className="text-green-500" />
                  Secure Checkout
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-4 py-3 rounded-xl">
                  <Heart
                    size={18}
                    className={isWishlisted ? "text-red-500 fill-red-500" : "text-slate-500"}
                  />
                  {isWishlisted ? "Wishlisted" : "Save for later"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 mt-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Customer Reviews</h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-3xl font-black text-slate-900">
                    {reviewSummary.count ? reviewSummary.avgRating.toFixed(1) : "0.0"}
                  </span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={17}
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

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500 font-medium">
                  No reviews yet. Be the first!
                </div>
              ) : (
                reviews.slice(0, 5).map((r) => (
                  <div
                    key={r._id}
                    className="rounded-[1.5rem] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                size={14}
                                fill={n <= (r.rating || 0) ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                          <p className="font-black text-slate-900">
                            {r.title || "Review"}
                          </p>
                        </div>
                        <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                          {r.comment}
                        </p>
                        <p className="mt-3 text-xs text-slate-400 font-bold">
                          {r.userName ? `By ${r.userName}` : "User"}{" "}
                          {r.createdAt
                            ? `• ${new Date(r.createdAt).toLocaleDateString()}`
                            : ""}
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
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-900 mb-5">
              <MessageSquare size={18} />
              {myReview ? "Update your review" : "Write a review"}
            </h3>

            {!userId ? (
              <p className="text-slate-500 font-medium">Login to write a review.</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-600">Rating *</label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewForm((p) => ({ ...p, rating: n }))}
                        className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center hover:scale-105 transition"
                      >
                        <Star
                          size={20}
                          className="text-amber-400"
                          fill={n <= Number(reviewForm.rating) ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Title *</label>
                  <input
                    value={reviewForm.title}
                    onChange={(e) =>
                      setReviewForm((p) => ({ ...p, title: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-50 transition"
                    placeholder="Example: Great quality!"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Comment *</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((p) => ({ ...p, comment: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none min-h-32 resize-none focus:border-green-400 focus:ring-4 focus:ring-green-50 transition"
                    placeholder="Write your review..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveReview}
                  disabled={!isReviewValid}
                  className={`w-full px-6 py-3.5 rounded-2xl font-bold transition ${isReviewValid
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
  );
};

export default ProductDetails;