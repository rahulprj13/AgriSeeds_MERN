import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, IndianRupee, Ban } from "lucide-react";

const API_URL = "http://localhost:5000";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const isOutOfStock = product.stock <= 0;
  const isInactive = product.status !== "active";

  if (isInactive) return null;

  const sellerPrice = Number(product.currentPrice) || 0;
  const originalPrice = Number(product.price) || 0;

  const discountPercent =
    sellerPrice > 0 && sellerPrice !== originalPrice
      ? Math.round(
          (Math.abs(originalPrice - sellerPrice) / Math.max(originalPrice, sellerPrice)) * 100
        )
      : 0;

  const categoryName = product.categoryId?.name?.toLowerCase() || "seeds";
  const productName = product.name?.toLowerCase().replace(/\s+/g, "-");

  const imageSrc = product.imagePath
    ? product.imagePath.startsWith("http")
      ? product.imagePath
      : `${API_URL}/uploads/${product.imagePath}`
    : "https://placehold.co/400x400?text=No+Image";

  const handleNavigate = () => {
    if (!isOutOfStock) {
      navigate(`/category/${categoryName}/${productName}/${product._id}`, {
        state: product,
      });
    }
  };

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-[26px] border bg-white transition-all duration-300 cursor-pointer
      ${
        isOutOfStock
          ? "border-slate-200 opacity-85"
          : "border-slate-100 shadow-sm hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-100/60"
      }`}
    >
      {/* Top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-50/70 to-transparent" />

      {/* Image */}
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-4">
        <img
          src={imageSrc}
          alt={product.name}
          onClick={handleNavigate}
          className={`h-full w-full object-contain transition duration-500 ${
            !isOutOfStock ? "group-hover:scale-105" : "grayscale-[0.35]"
          }`}
        />

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur">
            {product.weight} {product.unit}
          </span>
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {isOutOfStock ? (
            <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
              Out of Stock
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
              In Stock
            </span>
          )}

          {!isOutOfStock && discountPercent > 0 && (
            <span className="rounded-full bg-rose-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
            <div className="rounded-2xl border border-white/60 bg-white/85 px-4 py-2 shadow-lg backdrop-blur">
              <p className="text-xs font-black uppercase tracking-wider text-slate-800">
                Currently Unavailable
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2">
          <h3
            className={`line-clamp-1 text-[16px] font-black tracking-tight ${
              isOutOfStock
                ? "text-slate-500"
                : "text-slate-800 group-hover:text-emerald-600"
            }`}
          >
            {product.name}
          </h3>
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col">
            <div
              className={`flex items-center text-[22px] font-black ${
                isOutOfStock ? "text-slate-400" : "text-slate-900"
              }`}
            >
              <IndianRupee size={16} strokeWidth={3} />
              <span>{sellerPrice}</span>
            </div>

            {originalPrice !== sellerPrice && (
              <span className="text-xs font-bold text-slate-400 line-through decoration-rose-400/60">
                ₹{originalPrice}
              </span>
            )}
          </div>

          <button
            disabled={isOutOfStock}
            onClick={handleNavigate}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer
            ${
              isOutOfStock
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-emerald-600 hover:shadow-emerald-200"
            }`}
          >
            {isOutOfStock ? <Ban size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;