import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  // Get product id from URL
  const { id } = useParams();

  // Used for navigation and previous route info
  const location = useLocation();
  const navigate = useNavigate();

  // Get logged-in user and token from auth context
  const { user, token } = useContext(AuthContext);

  // Cart functions from cart context
  const { addToCart, cart, incrementQuantity, decrementQuantity, removeFromCart } =
    useContext(CartContext);

  // Product state
  const [product, setProduct] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  // Review summary and review list state
  const [reviewSummary, setReviewSummary] = useState({ avgRating: 0, count: 0 });
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Rating selected by user in review form
  const [selectedRating, setSelectedRating] = useState(5);

  // Clean title/comment input
  // Removes HTML tags and unwanted characters
  const cleanReviewText = (value = "", field = "comment") => {
    let text = String(value);

    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, "");

    // Remove < and >
    text = text.replace(/[<>]/g, "");

    // Title allows fewer special characters
    if (field === "title") {
      text = text.replace(/[^A-Za-z0-9\s.,!?()'"&-]/g, "");
      return text.slice(0, 60);
    }

    // Comment allows common readable characters
    text = text.replace(/[^A-Za-z0-9\s.,!?()'"@:&/-]/g, "");
    return text.slice(0, 500);
  };

  // Review form validation rules
  const reviewValidationRules = {
    title: {
      required: "Review title is required*",
      minLength: {
        value: 3,
        message: "Title must be at least 3 characters*",
      },
      maxLength: {
        value: 60,
        message: "Title cannot exceed 60 characters*",
      },
      validate: (value) => {
        const cleaned = cleanReviewText(value, "title").trim();
        if (!cleaned) return "Review title is required*";
        if (cleaned !== value.trim()) {
          return "HTML tags or unwanted characters are not allowed*";
        }
        return true;
      },
    },

    comment: {
      required: "Review comment is required*",
      minLength: {
        value: 10,
        message: "Comment must be at least 10 characters*",
      },
      maxLength: {
        value: 500,
        message: "Comment cannot exceed 500 characters*",
      },
      validate: (value) => {
        const cleaned = cleanReviewText(value, "comment").trim();
        if (!cleaned) return "Review comment is required*";
        if (cleaned !== value.trim()) {
          return "HTML tags or unwanted characters are not allowed*";
        }
        return true;
      },
    },
  };

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      comment: "",
    },
  });

  // Current user id
  const userId = user?._id || user?.id || null;

  // Fetch product on page load or id change
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

  // Product price values
  const sellerPrice = Number(product?.currentPrice) || 0;
  const Price = Number(product?.price) || 0;

  // Calculate discount percentage
  const discountPercent =
    sellerPrice > 0 && sellerPrice !== Price
      ? Math.round((Math.abs(sellerPrice - Price) / Math.max(sellerPrice, Price)) * 100)
      : 0;

  // Product image URL
  const productImage = product?.imagePath
    ? product.imagePath.startsWith("http")
      ? product.imagePath
      : `${API_URL}/uploads/${product.imagePath}`
    : "https://placehold.co/600x600?text=No+Image";

  // Add product to cart
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

  // Find current product in cart
  const cartItem = cart.find((item) => {
    const pid = item.productId?._id || item.productId;
    return String(pid) === String(product?._id);
  });

  // Review form valid check
  const isReviewValid =
    Boolean(userId && token) &&
    Number(selectedRating) >= 1 &&
    Number(selectedRating) <= 5 &&
    isValid;

  // Fetch review summary and all reviews
  const fetchReviewsAndSummary = async () => {
    if (!product?._id) return;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      // Fetch review summary
      const summaryRes = await axios.get(
        `${API_URL}/api/products/${product._id}/reviews/summary`,
        { headers }
      );
      const summary = summaryRes.data?.data || { avgRating: 0, count: 0 };

      setReviewSummary({
        avgRating: Number(summary.avgRating ?? 0),
        count: Number(summary.count ?? 0),
      });

      // Fetch all reviews
      const listRes = await axios.get(`${API_URL}/api/products/${product._id}/reviews`, {
        headers,
      });
      const list = Array.isArray(listRes.data?.data) ? listRes.data.data : [];
      setReviews(list);

      // Find current user's review
      if (userId) {
        const mine =
          list.find((r) => String(r.userId?._id || r.userId) === String(userId)) || null;

        setMyReview(mine);

        // If review exists, fill form with old values
        if (mine) {
          setSelectedRating(Number(mine.rating ?? 5));
          reset({
            title: mine.title || "",
            comment: mine.comment || "",
          });
        } else {
          // Reset form if no review exists
          setSelectedRating(5);
          reset({
            title: "",
            comment: "",
          });
        }
      } else {
        // Reset everything if user not logged in
        setMyReview(null);
        setSelectedRating(5);
        reset({
          title: "",
          comment: "",
        });
      }
    } catch (e) {
      console.log("REVIEW_FETCH_ERROR", e?.message || e);
    }
  };

  // Fetch wishlist state
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

  // Add or remove product from wishlist
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

  // Submit or update review
  const onSubmitReview = async (data) => {
    if (!userId || !token) {
      toast.info("Please login first");
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    const rating = Number(selectedRating);
    const title = cleanReviewText(data.title, "title").trim();
    const comment = cleanReviewText(data.comment, "comment").trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/products/${product._id}/reviews`,
        { rating, title, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(myReview ? "Review updated successfully" : "Review submitted successfully");
      await fetchReviewsAndSummary();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Review failed");
    }
  };

  // Delete current user's review
  const handleDeleteMyReview = async () => {
    if (!myReview?._id) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this review?");
    if (!confirmDelete) {
      toast.info("Review delete cancelled");
      return;
    }

    try {
      setWishlistLoading(true);

      await axios.delete(`${API_URL}/api/products/${product._id}/reviews/${myReview._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Review deleted successfully");
      await fetchReviewsAndSummary();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Delete failed");
    } finally {
      setWishlistLoading(false);
    }
  };

  // Fetch reviews and wishlist whenever product or user changes
  useEffect(() => {
    fetchReviewsAndSummary();
    fetchWishlistState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id, userId, token]);

  // Loading UI
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

  // Product not found UI
  if (!product) return <div className="text-center py-20 font-bold">Product Not Found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fffb] via-white to-[#eefbf3] pb-20 font-sans selection:bg-green-100 selection:text-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-green-600 transition-all font-bold text-sm uppercase tracking-widest cursor-pointer"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_25px_80px_rgba(16,24,40,0.08)]">
          <div className="grid lg:grid-cols-2">
            {/* Left side product image section */}
            <div className="relative flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6 md:p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-slate-100 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 h-24 w-24 rounded-full bg-green-200/40 blur-3xl"></div>
                <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl"></div>
              </div>

              {/* Discount and weight badge */}
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

              {/* Wishlist button */}
              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`absolute top-6 right-6 z-20 h-12 w-12 rounded-full border shadow-lg backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
                  isWishlisted
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "bg-white/90 border-slate-200 text-slate-600 hover:bg-white hover:text-red-500"
                } disabled:opacity-60`}
              >
                <Heart
                  size={20}
                  className={isWishlisted ? "fill-red-500 text-red-500" : ""}
                />
              </button>

              {/* Product image */}
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

            {/* Right side product details */}
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

              {/* Product name */}
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight capitalize tracking-tight">
                {product.name}
              </h1>

              {/* Product description */}
              <div className="mt-5 max-w-2xl">
                {product.description ? (
                  <ul className="space-y-3">
                    {product.description
                      .split("\n")
                      .filter((line) => line.trim() !== "")
                      .map((line, index) => {
                        const cleanLine = line.replace(/^•\s*/, "").trim();
                        return (
                          <li
                            key={index}
                            className="flex items-start gap-3 text-slate-600 text-base md:text-lg leading-relaxed"
                          >
                            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-green-500 shrink-0"></span>
                            <span>{cleanLine}</span>
                          </li>
                        );
                      })}
                  </ul>
                ) : (
                  <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                    Handpicked premium selection ensuring maximum freshness and superior quality for your daily needs.
                  </p>
                )}
              </div>

              {/* Price section */}
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

              {/* Product highlights */}
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

              {/* Cart and buy now buttons */}
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
                      onClick={() => incrementQuantity(cartItem._id, cartItem.quantity)}
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

              {/* Small product info badges */}
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

        {/* Review section */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 mt-8">
          {/* Left side: customer review list */}
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

                      {/* Show delete only for logged-in user's own review */}
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

          {/* Right side: review form */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-900 mb-5">
              <MessageSquare size={18} />
              {myReview ? "Update your review" : "Write a review"}
            </h3>

            {!userId ? (
              <p className="text-slate-500 font-medium">Login to write a review.</p>
            ) : (
              <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-5">
                {/* Rating selection */}
                <div>
                  <label className="text-sm font-bold text-slate-600">Rating *</label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSelectedRating(n)}
                        className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center hover:scale-105 transition"
                      >
                        <Star
                          size={20}
                          className="text-amber-400"
                          fill={n <= Number(selectedRating) ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review title input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Title *</label>
                  <input
                    {...register("title", reviewValidationRules.title)}
                    onChange={(e) =>
                      setValue("title", cleanReviewText(e.target.value, "title"), {
                        shouldValidate: true,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-2xl border outline-none focus:ring-4 transition ${
                      errors.title
                        ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                        : "border-slate-200 focus:border-green-400 focus:ring-green-50"
                    }`}
                    placeholder="Example: Great quality!"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>
                  )}
                  <p className="text-[11px] text-slate-400 text-right">
                    {watch("title")?.length || 0}/60
                  </p>
                </div>

                {/* Review comment textarea */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Comment *</label>
                  <textarea
                    {...register("comment", reviewValidationRules.comment)}
                    onChange={(e) =>
                      setValue("comment", cleanReviewText(e.target.value, "comment"), {
                        shouldValidate: true,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-2xl border outline-none min-h-32 resize-none focus:ring-4 transition ${
                      errors.comment
                        ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                        : "border-slate-200 focus:border-green-400 focus:ring-green-50"
                    }`}
                    placeholder="Write your review..."
                  />
                  {errors.comment && (
                    <p className="text-xs text-red-500 font-medium">{errors.comment.message}</p>
                  )}
                  <p className="text-[11px] text-slate-400 text-right">
                    {watch("comment")?.length || 0}/500
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!isReviewValid}
                  className={`w-full px-6 py-3.5 rounded-2xl font-bold transition ${
                    isReviewValid
                      ? "bg-slate-900 text-white hover:bg-green-600"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {myReview ? "Save changes" : "Submit review"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;