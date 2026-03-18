import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { CategoryContext } from "../context/CategoryContext";
// 1. ProductCard ko import karein (path check kar lena apne hisab se)
import ProductCard from "./ProductCard";
import { ShoppingBag } from "lucide-react";

const API_URL = "http://localhost:5000";

const Products = () => {
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
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <EmptyState categoryName={currentCategory.name} />
                )}
            </div>
        </div>
    );
};

// Sub-components 
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

export default Products;