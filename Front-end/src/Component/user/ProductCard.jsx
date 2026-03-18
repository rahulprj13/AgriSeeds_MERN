import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, IndianRupee } from "lucide-react";

const API_URL = "http://localhost:5000";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const sellerPrice = Number(product.currentPrice) || 0;
    const Price = Number(product.price) || 0;

    const discountPercent = (sellerPrice > 0 && sellerPrice !== Price)
        ? Math.round((Math.abs(sellerPrice - Price) / Math.max(sellerPrice, Price)) * 100)
        : 0;

    // For URL construction
    const categoryName = product.categoryId?.name?.toLowerCase() || "seeds";
    const productName = product.name?.toLowerCase().replace(/\s+/g, '-');

    const imageSrc = product.imagePath
        ? (product.imagePath.startsWith('http') ? product.imagePath : `${API_URL}/uploads/${product.imagePath}`)
        : "https://placehold.co/400x400?text=No+Image";

    return (
        <div className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-500 overflow-hidden flex flex-col relative">
            {/* Image */}
            <div className="relative h-60 overflow-hidden bg-slate-100">
                <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {discountPercent > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase">
                            {discountPercent}% OFF
                        </span>
                    )}
                    <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase">
                        {product.weight} {product.unit}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col grow">
                <h3 className="text-lg font-black text-slate-800 group-hover:text-green-600 transition-colors line-clamp-1">
                    {product.name}
                </h3>
                <p className="text-slate-400 text-xs mt-1 font-medium line-clamp-2 leading-relaxed">
                    {product.description}
                </p>

                <div className="mt-auto flex items-end justify-between pt-4">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-900 flex items-center">
                            <IndianRupee size={18} strokeWidth={3} /> {sellerPrice}
                            {Price !== sellerPrice && (
                                <span className="ml-2 text-slate-400 line-through text-xs font-bold decoration-red-400/50">
                                    ₹{Price}
                                </span>
                            )}
                        </span>
                    </div>
                    <button
                        onClick={() => navigate(`/category/${categoryName}/${productName}/${product._id}`, { state: product })}
                        className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-green-600 transition-all duration-300 shadow-lg shadow-slate-200 hover:shadow-green-200"
                    >
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;