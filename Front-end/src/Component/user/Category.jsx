import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { CategoryContext } from "../context/CategoryContext";
// Icons ke liye (lucide-react install hona chahiye)
import { ShoppingBag, ArrowRight, IndianRupee, Info } from "lucide-react";

const API_URL = "http://localhost:5000";

const Category = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const { categories } = useContext(CategoryContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentCategory = categories.find(
        (cat) => cat.name.toLowerCase() === type?.toLowerCase()
    );

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/admin/products`);
                if (currentCategory) {
                    const filtered = res.data.filter(
                        (p) => (p.categoryId?._id || p.categoryId) === currentCategory._id
                    );
                    setProducts(filtered);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        if (currentCategory) fetchProducts();
    }, [currentCategory]);

    if (!currentCategory) return <NotFound />;

    return (
        <div className="max-w-7xl mx-auto bg-[#f8fafc]">
            {/* --- HERO SECTION --- */}
            <div className="relative bg-white border-b border-slate-200 overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-400 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-blue-400 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="max-w-7xl mx-auto px-6 py-10 md:py-12 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                        {/* Left Side: Text Content */}
                        <div className="text-left max-w-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-8 h-0.5 bg-green-500"></span>
                                <span className="text-[10px] font-black tracking-[0.3em] text-green-600 uppercase">
                                    Premium Selection
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                                Fresh <span className="text-green-600 relative">
                                    {currentCategory.name}
                                    <svg className="absolute -bottom-2 left-0 w-full h-2 text-green-200/60 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 25 0 50 5 T 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                                    </svg>
                                </span>
                            </h1>
                        </div>

                        {/* Right Side: Description with Glass effect */}
                        <div className="md:max-w-xs">
                            <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed border-l-4 border-green-100 pl-4 py-1">
                                {currentCategory.description || `High-quality ${currentCategory.name} handpicked and delivered fresh to your doorstep.`}
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- PRODUCTS SECTION --- */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-green-600/20 border-t-green-600 rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} navigate={navigate} />
                        ))}
                    </div>
                ) : (
                    <EmptyState categoryName={currentCategory.name} />
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS FOR CLEAN CODE ---

const ProductCard = ({ product, navigate }) => {
    const oldPrice = Number(product.discountPrice) || 0;
    const currentPrice = Number(product.price) || 0;

    // Logic: Agar oldPrice 0 hai to OFF nahi dikhayega
    // Agar oldPrice 0 se bada hai, to dono ka difference calculate karega
    const discountPercent = (oldPrice > 0 && oldPrice !== currentPrice)
        ? Math.round((Math.abs(oldPrice - currentPrice) / Math.max(oldPrice, currentPrice)) * 100)
        : 0;

    return (
        <div className="group bg-white rounded-4xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-green-900/5 transition-all duration-500 overflow-hidden flex flex-col relative">

            {/* Image Section */}
            <div className="relative h-64 overflow-hidden bg-slate-100">
                <img
                    src={
                        product.imagePath
                            ? (product.imagePath.startsWith('http')
                                ? product.imagePath
                                : `${API_URL}/uploads/${product.imagePath}`)
                            : "https://placehold.co/400x400?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    onError={(e) => {
                        e.target.src = "https://placehold.co/400x400?text=Image+Not+Found";
                    }}
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {/* Yahan Condition change ki hai taaki badge display ho sake */}
                    {discountPercent > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-tighter inline-block">
                            {discountPercent}% OFF
                        </span>
                    )}
                    <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase inline-block">
                        {product.weight} {product.unit}
                    </span>
                </div>
            </div>

            {/* Details Section */}
            <div className="p-6 flex flex-col grow">
                <div className="mb-4">
                    <h3 className="text-lg font-black text-slate-800 group-hover:text-green-600 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 font-medium line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                </div>

                <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col">
                        {product.discountPrice !== undefined && (
                            <span className="text-slate-300 line-through text-xs font-bold decoration-red-400/50">
                                ₹{product.discountPrice}
                            </span>
                        )}
                        <span className="text-2xl font-black text-slate-900 flex items-center">
                            <IndianRupee size={18} strokeWidth={3} /> {product.price}
                        </span>
                    </div>

                    <button
                        onClick={() => navigate(`${product.name}/${product._id}`, { state: product })}
                        className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-green-600 transition-all duration-300 group/btn shadow-xl shadow-slate-200 hover:shadow-green-200 active:scale-95"
                    >
                        <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};
const EmptyState = ({ categoryName }) => (
    <div className="text-center py-20 px-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-slate-300" size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Oops! Stock is empty.</h3>
        <p className="text-slate-400 font-medium max-w-xs mx-auto">
            We are currently restocking our fresh {categoryName}. Check back in a few hours!
        </p>
    </div>
);

const NotFound = () => (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
            <h1 className="text-9xl font-black text-slate-100">404</h1>
            <p className="text-2xl font-bold text-slate-800 -mt-10 mb-8">Category Not Found</p>
            <Link to="/" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all">
                Back to Home
            </Link>
        </div>
    </div>
);

export default Category;