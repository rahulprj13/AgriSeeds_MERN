import React, { useContext, useEffect, useMemo, useState } from "react";
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
  Leaf,
  PackageCheck,
  BadgeCheck,
  Sparkles,
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

  const [selectedRating, setSelectedRating] = useState(5);

  const cleanReviewText = (value = "", field = "comment") => {
    let text = String(value);
    text = text.replace(/<[^>]*>/g, "");
    text = text.replace(/[<>]/g, "");

    if (field === "title") {
      text = text.replace(/[^A-Za-z0-9\s.,!?()'"&-]/g, "");
      return text.slice(0, 60);
    }

    text = text.replace(/[^A-Za-z0-9\s.,!?()'"@:&/-]/g, "");
    return text.slice(0, 500);
  };

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
  const originalPrice = Number(product?.price) || 0;

  const discountPercent =
    sellerPrice > 0 && sellerPrice !== originalPrice
      ? Math.round(
          (Math.abs(sellerPrice - originalPrice) / Math.max(sellerPrice, originalPrice)) *
            100
        )
      : 0;

  const productImage = product?.imagePath
    ? product.imagePath.startsWith("http")
      ? product.imagePath
      : `${API_URL}/uploads/${product.imagePath}`
    : "https://placehold.co/600x600?text=No+Image";

  const cartItem = cart.find((item) => {
    const pid = item.productId?._id || item.productId;
    return String(pid) === String(product?._id);
  });

  const stockStatus = useMemo(() => {
    const stock = Number(product?.stock) || 0;
    if (stock <= 0) return "Out of stock";
    if (stock <= 5) return "Limited stock";
    return "In stock";
  }, [product?.stock]);

  const isReviewValid =
    Boolean(userId && token) &&
    Number(selectedRating) >= 1 &&
    Number(selectedRating) <= 5 &&
    isValid;

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
          setSelectedRating(Number(mine.rating ?? 5));
          reset({
            title: mine.title || "",
            comment: mine.comment || "",
          });
        } else {
          setSelectedRating(5);
          reset({
            title: "",
            comment: "",
          });
        }
      } else {
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

  useEffect(() => {
    fetchReviewsAndSummary();
    fetchWishlistState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id, userId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_#ecfdf5,_#ffffff,_#f8fafc)]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
        <div className="rounded-[28px] border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <h2 className="text-2xl font-black text-slate-900">Product Not Found</h2>
          <p className="mt-2 text-slate-500">The product you are looking for is unavailable.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-2xl bg-slate-900 px-6 py-3 font-bold text-white hover:bg-green-600 transition"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f0fdf4,_#ffffff_45%,_#f8fafc)] pb-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-green-200 hover:text-green-600"
        >
          <ArrowLeft size={17} className="transition group-hover:-translate-x-1" />
          Back to Shop
        </button>

        <div className="mt-6 overflow-hidden rounded-[34px] border border-white/70 bg-white/90 shadow-[0_22px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
            <div className="relative border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-6 md:p-10 lg:border-b-0 lg:border-r lg:p-14">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-10 top-12 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />
                <div className="absolute right-6 bottom-8 h-36 w-36 rounded-full bg-lime-200/30 blur-3xl" />
              </div>

              <div className="absolute left-6 top-6 z-20 flex flex-wrap gap-3">
                {discountPercent > 0 && (
                  <span className="rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-[11px] font-black tracking-[0.2em] text-white shadow-lg">
                    SAVE {discountPercent}%
                  </span>
                )}
                <span className="rounded-full border border-white/70 bg-white/95 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 shadow-sm">
                  {product.weight} {product.unit}
                </span>
              </div>

              <button
                type="button"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition ${
                  isWishlisted
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-slate-200 bg-white text-slate-600 hover:text-red-500"
                }`}
              >
                <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
              </button>

              <div className="relative mx-auto flex max-w-xl items-center justify-center">
                <div className="absolute inset-0 rounded-[34px] bg-gradient-to-br from-emerald-100/70 via-transparent to-lime-100/60 blur-3xl" />
                <div className="relative w-full rounded-[34px] border border-white bg-white/90 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] md:p-10">
                  <img
                    src={productImage}
                    alt={product.name}
                    className="h-[320px] w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.12)] transition duration-700 hover:scale-105 md:h-[430px]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-10 lg:p-14">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-amber-600">
                  <Star size={13} fill="currentColor" />
                  Premium Quality
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-green-600">
                  <ShieldCheck size={13} />
                  Trusted Product
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] border ${
                    stockStatus === "Out of stock"
                      ? "border-red-100 bg-red-50 text-red-600"
                      : stockStatus === "Limited stock"
                      ? "border-orange-100 bg-orange-50 text-orange-600"
                      : "border-emerald-100 bg-emerald-50 text-emerald-600"
                  }`}
                >
                  <BadgeCheck size={13} />
                  {stockStatus}
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl capitalize">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 font-bold text-slate-600">
                  <Sparkles size={15} className="text-green-500" />
                  Freshly Selected
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 font-bold text-slate-600">
                  <Truck size={15} className="text-slate-500" />
                  Fast Delivery
                </div>
              </div>

              <div className="mt-2 max-w-2xl">
                {product.description ? (
                  <ul className="space-y-1 ">
                    {product.description
                      .split("\n")
                      .filter((line) => line.trim() !== "")
                      .map((line, index) => {
                        const cleanLine = line.replace(/^•\s*/, "").trim();
                        return (
                          <li
                            key={index}
                            className="flex items-start gap-2 rounded-2xl bg-slate-50/70 px-4 py-1 text-base leading-relaxed text-slate-600"
                          >
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                            <span>{cleanLine}</span>
                          </li>
                        );
                      })}
                  </ul>
                ) : (
                  <p className="rounded-2xl bg-slate-50/70 px-4 py-4 text-base leading-relaxed text-slate-600 md:text-lg">
                    Handpicked premium selection ensuring maximum freshness and superior quality for your daily needs.
                  </p>
                )}
              </div>

              <div className="mt-8 rounded-[30px] border border-slate-100 bg-gradient-to-r from-slate-50 via-white to-green-50 p-5 shadow-sm md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div>
                    <p className="mb-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Current Price
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center text-3xl font-black text-emerald-600 md:text-4xl">
                        <IndianRupee size={26} strokeWidth={3} />
                        {sellerPrice}
                      </span>
                      {originalPrice > sellerPrice && (
                        <span className="text-lg font-bold text-slate-300 line-through md:text-xl">
                          ₹{originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {discountPercent > 0 && (
                    <div className="rounded-2xl bg-rose-50 px-4 py-3 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">
                        Discount
                      </p>
                      <p className="text-2xl font-black text-rose-500">{discountPercent}%</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Leaf size={18} className="text-green-500" />
                    Fresh & Organic
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Clock size={18} className="text-blue-500" />
                    Fast Shipping
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <PackageCheck size={18} className="text-slate-600" />
                    Safe Delivery
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                {cartItem ? (
                  <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-100 bg-slate-50 p-3">
                    <button
                      onClick={() => decrementQuantity(cartItem._id, cartItem.quantity)}
                      className="rounded-xl bg-white px-4 py-2 font-black text-slate-700 shadow-sm hover:bg-slate-100"
                    >
                      -
                    </button>
                    <div className="min-w-[52px] rounded-xl bg-white px-4 py-2 text-center text-lg font-black text-slate-900 shadow-sm">
                      {cartItem.quantity}
                    </div>
                    <button
                      onClick={() => incrementQuantity(cartItem._id, cartItem.quantity)}
                      className="rounded-xl bg-white px-4 py-2 font-black text-slate-700 shadow-sm hover:bg-slate-100"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(cartItem._id)}
                      className="rounded-xl bg-rose-50 px-4 py-2 font-bold text-rose-600 hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="flex min-h-[58px] flex-1 items-center justify-center gap-3 rounded-[22px] bg-slate-900 px-6 text-base font-black text-white shadow-lg transition hover:bg-green-600 active:scale-[0.99] md:text-lg"
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
                  className="flex min-h-[58px] flex-1 items-center justify-center gap-3 rounded-[22px] bg-gradient-to-r from-green-500 to-emerald-500 px-6 text-base font-black text-white shadow-lg transition hover:opacity-95 active:scale-[0.99] md:text-lg"
                >
                  <Zap size={20} fill="currentColor" />
                  Buy Now
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  <Truck size={17} className="text-slate-500" />
                  Free Shipping
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  <CheckCircle2 size={17} className="text-green-500" />
                  Secure Checkout
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  <Heart size={17} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
                  {isWishlisted ? "Wishlisted" : "Save for Later"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Customer Reviews</h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
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
                  <span className="text-sm font-bold text-slate-500">
                    {reviewSummary.count} review{reviewSummary.count === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500 font-medium">
                  No reviews yet. Be the first to share your experience.
                </div>
              ) : (
                reviews.slice(0, 5).map((r) => (
                  <div
                    key={r._id}
                    className="rounded-[24px] border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm"
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
                          <p className="font-black text-slate-900">{r.title || "Review"}</p>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{r.comment}</p>

                        <p className="mt-3 text-xs font-bold text-slate-400">
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
                          className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-100"
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

          <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <h3 className="mb-5 flex items-center gap-2 text-xl font-black text-slate-900">
              <MessageSquare size={18} />
              {myReview ? "Update your review" : "Write a review"}
            </h3>

            {!userId ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <p className="font-medium text-slate-500">Login to write a review.</p>
                <button
                  onClick={() => navigate("/login", { state: { from: location.pathname } })}
                  className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-green-600"
                >
                  Login Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-600">Rating *</label>
                  <div className="mt-2 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSelectedRating(n)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                          n <= Number(selectedRating)
                            ? "border-amber-200 bg-amber-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
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

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Title *</label>
                  <input
                    {...register("title", reviewValidationRules.title)}
                    onChange={(e) =>
                      setValue("title", cleanReviewText(e.target.value, "title"), {
                        shouldValidate: true,
                      })
                    }
                    className={`w-full rounded-2xl border px-4 py-3 outline-none transition focus:ring-4 ${
                      errors.title
                        ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                        : "border-slate-200 focus:border-green-400 focus:ring-green-50"
                    }`}
                    placeholder="Example: Great quality!"
                  />
                  {errors.title && (
                    <p className="text-xs font-medium text-red-500">{errors.title.message}</p>
                  )}
                  <p className="text-right text-[11px] text-slate-400">
                    {watch("title")?.length || 0}/60
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Comment *</label>
                  <textarea
                    {...register("comment", reviewValidationRules.comment)}
                    onChange={(e) =>
                      setValue("comment", cleanReviewText(e.target.value, "comment"), {
                        shouldValidate: true,
                      })
                    }
                    className={`min-h-32 w-full resize-none rounded-2xl border px-4 py-3 outline-none transition focus:ring-4 ${
                      errors.comment
                        ? "border-red-400 focus:border-red-400 focus:ring-red-50"
                        : "border-slate-200 focus:border-green-400 focus:ring-green-50"
                    }`}
                    placeholder="Write your review..."
                  />
                  {errors.comment && (
                    <p className="text-xs font-medium text-red-500">{errors.comment.message}</p>
                  )}
                  <p className="text-right text-[11px] text-slate-400">
                    {watch("comment")?.length || 0}/500
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!isReviewValid}
                  className={`w-full rounded-2xl px-6 py-3.5 font-bold transition ${
                    isReviewValid
                      ? "bg-slate-900 text-white hover:bg-green-600"
                      : "cursor-not-allowed bg-slate-200 text-slate-500"
                  }`}
                >
                  {myReview ? "Save Changes" : "Submit Review"}
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