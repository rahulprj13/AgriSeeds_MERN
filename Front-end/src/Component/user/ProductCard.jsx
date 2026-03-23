import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, IndianRupee, Ban } from "lucide-react"; 

const API_URL = "http://localhost:5000";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    // Check if product is in-stock
    const isOutOfStock =  product.stock <= 0;

    //check if product is Inactive
    const isInactive = product.status !== "active"; 

    // If inactive, return null so nothing renders
    if (isInactive) return null;
    
    const sellerPrice = Number(product.currentPrice) || 0;
    const Price = Number(product.price) || 0;

    const discountPercent = (sellerPrice > 0 && sellerPrice !== Price)
        ? Math.round((Math.abs(sellerPrice - Price) / Math.max(sellerPrice, Price)) * 100)
        : 0;

    const categoryName = product.categoryId?.name?.toLowerCase() || "seeds";
    const productName = product.name?.toLowerCase().replace(/\s+/g, '-');

    const imageSrc = product.imagePath
        ? (product.imagePath.startsWith('http') ? product.imagePath : `${API_URL}/uploads/${product.imagePath}`)
        : "https://placehold.co/400x400?text=No+Image";

    return (
        <div className={`group bg-white rounded-3xl border border-slate-100 shadow-sm transition-all duration-500 overflow-hidden flex flex-col relative 
            ${isOutOfStock ? "opacity-75 grayscale-[0.5]" : "hover:shadow-2xl hover:shadow-green-900/5"}`}>
            
            {/* Image Container */}
            <div className="relative h-60 overflow-hidden bg-slate-100">
                <img
                    src={imageSrc}
                    alt={product.name}
                    onClick={() => !isOutOfStock && navigate(`/category/${categoryName}/${productName}/${product._id}`, { state: product })}
                    className={`w-full h-full object-cover transition duration-500 ${!isOutOfStock && "group-hover:scale-110"}`}
                />
                
                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {isOutOfStock ? (
                        <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                            Out of Stock
                        </span>
                    ) : (
                        <>
                            <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                                In Stock
                            </span>
                            {discountPercent > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase">
                                    {discountPercent}% OFF
                                </span>
                            )}
                        </>
                    )}
                    
                    <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase">
                        {product.weight} {product.unit}
                    </span>
                </div>

                {/* Out of Stock Overlay Text */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
                         <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl border border-white/50 shadow-xl">
                            <p className="text-slate-900 font-black text-sm uppercase">Currently Unavailable</p>
                         </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col grow">
                <h3 className={`text-lg font-black transition-colors line-clamp-1 ${isOutOfStock ? "text-slate-500" : "text-slate-800 group-hover:text-green-600"}`}>
                    {product.name}
                </h3>
                {/* <p className="text-slate-400 text-xs mt-1 font-medium line-clamp-2 leading-relaxed">
                    {product.description}
                </p> */}

                <div className="mt-auto flex items-end justify-between pt-4">
                    <div className="flex flex-col">
                        <span className={`text-2xl font-black flex items-center ${isOutOfStock ? "text-slate-400" : "text-slate-900"}`}>
                            <IndianRupee size={18} strokeWidth={3} /> {sellerPrice}
                            {Price !== sellerPrice && (
                                <span className="ml-2 text-slate-400 line-through text-xs font-bold decoration-red-400/50">
                                    ₹{Price}
                                </span>
                            )}
                        </span>
                    </div>
                    
                    <button
                        disabled={isOutOfStock}
                        onClick={() => !isOutOfStock && navigate(`/category/${categoryName}/${productName}/${product._id}`, { state: product })}
                        className={`p-4 rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center
                            ${isOutOfStock 
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                : "bg-slate-900 text-white hover:bg-green-600 shadow-slate-200 hover:shadow-green-200"}`}
                    >
                        {isOutOfStock ? <Ban size={20} /> : <ArrowRight size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;