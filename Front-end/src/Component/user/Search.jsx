import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { CategoryContext } from "../context/CategoryContext";
import { IndianRupee, Ban, ArrowRight } from "lucide-react"; // Icons import karein

const API_URL = "http://localhost:5000";

const Search = () => {
    const { categories } = useContext(CategoryContext);
    const location = useLocation();
    const navigate = useNavigate();

    const query = new URLSearchParams(location.search);
    const searchText = query.get("q")?.toLowerCase().trim() || "";

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    useEffect(() => {
        let active = true;
        const loadProducts = async () => {
            if (!searchText) {
                setProducts([]);
                return;
            }
            try {
                setLoadingProducts(true);
                const res = await axios.get(`${API_URL}/api/admin/products`);
                if (!active) return;
                setProducts(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                if (!active) return;
                setProducts([]);
            } finally {
                if (!active) return;
                setLoadingProducts(false);
            }
        };
        loadProducts();
        return () => { active = false; };
    }, [searchText]);

    const results = useMemo(() => {
        if (!searchText) return [];

        // Filter categories
        const categoryResults = (categories || [])
            .filter((cat) => cat?.name?.toLowerCase().includes(searchText))
            .map((cat) => ({ type: "category", name: cat.name }));

        // Filter products with Out of Stock and Inactive logic
        const productResults = (products || [])
            .filter((p) => {
                // LOGIC: Inactive products ko search me mat dikhao
                if (p.status !== "active") return false;

                const name = (p?.name || "").toLowerCase();
                const catName = (p?.categoryId?.name || p?.category?.name || "").toLowerCase();
                return name.includes(searchText) || catName.includes(searchText);
            })
            .map((p) => {
                // Price aur Stock calculations
                const sellerPrice = Number(p.currentPrice) || 0;
                const oldPrice = Number(p.price) || 0;
                const isOutOfStock = p.stock <= 0;

                return {
                    type: "item",
                    name: p.name,
                    category: p?.categoryId?.name || p?.category?.name || "Seeds",
                    id: p._id,
                    image: p.imagePath
                        ? (p.imagePath.startsWith('http') ? p.imagePath : `${API_URL}/uploads/${p.imagePath}`)
                        : "https://placehold.co/400x400?text=No+Image",
                    isOutOfStock,
                    sellerPrice,
                    oldPrice,
                    rawProduct: p // Full product pass karein detail page ke liye
                };
            });

        return [...categoryResults, ...productResults].slice(0, 24);
    }, [categories, products, searchText]);

    const toSlug = (s) => String(s || "").toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="min-h-screen bg-slate-50 py-16">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-black mb-12 text-slate-900">
                    Search Results for <span className="text-green-600">"{searchText}"</span>
                </h1>

                {loadingProducts ? (
                    <div className="text-center mt-12 text-slate-500 font-bold animate-pulse">Searching seeds...</div>
                ) : results.length === 0 ? (
                    <div className="text-center mt-24">
                        <h2 className="text-3xl font-bold text-slate-800">No Results Found</h2>
                        <p className="text-slate-500 mt-2">Try different keywords or check spelling.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {results.map((res, index) => {
                            // Card styles based on stock status
                            const cardOpacity = res.isOutOfStock ? "opacity-75 grayscale-[0.5]" : "hover:shadow-2xl";

                            return (
                                <div
                                    key={index}
                                    onClick={() => {
                                        if (res.isOutOfStock && res.type === "item") return; // Disable click if out of stock
                                        const path = res.type === "category"
                                            ? `/category/${res.name}`
                                            : `/category/${toSlug(res.category)}/${toSlug(res.name)}/${res.id}`;
                                        navigate(path, { state: res.rawProduct });
                                    }}
                                    className={`group bg-white rounded-3xl border border-slate-100 shadow-sm transition-all duration-500 overflow-hidden flex flex-col relative ${cardOpacity} ${res.isOutOfStock ? "cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    {/* Image Section */}
                                    <div className="relative h-52 overflow-hidden bg-slate-100">
                                        {res.type === "category" ? (
                                            <div className="w-full h-full flex items-center justify-center text-6xl">
                                                <img src="https://5.imimg.com/data5/SELLER/Default/2024/11/465065635/JJ/VT/IH/2526329/agriculture-products-seeds-packaging-bags.jpg" alt="Fertilizers" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />

                                            </div>
                                        ) : (
                                            <img
                                                src={res.image}
                                                alt={res.name}
                                                className={`w-full h-full object-cover transition duration-500 ${!res.isOutOfStock && "group-hover:scale-110"}`}
                                            />
                                        )}

                                        {/* Badge Logic */}
                                        {res.type === "item" && (
                                            <div className="absolute top-3 left-3 flex flex-col gap-1">
                                                {res.isOutOfStock ? (
                                                    <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">Out of Stock</span>
                                                ) : (
                                                    <span className="bg-green-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">In Stock</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Unavailable Overlay */}
                                        {res.isOutOfStock && (
                                            <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
                                                <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-lg border border-white/50 shadow-xl">
                                                    <p className="text-slate-900 font-black text-[10px] uppercase">Unavailable</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Section */}
                                    <div className="p-5 flex flex-col grow">
                                        <span className="text-[10px] font-bold text-green-600 uppercase mb-1">
                                            {res.type === "category" ? "Collection" : res.category}
                                        </span>
                                        <h3 className="text-lg font-black text-slate-800 line-clamp-1 group-hover:text-green-600 transition-colors">
                                            {res.name}
                                        </h3>

                                        {res.type === "item" && (
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className={`text-xl font-black flex items-center ${res.isOutOfStock ? "text-slate-400" : "text-slate-900"}`}>
                                                        <IndianRupee size={14} strokeWidth={3} /> {res.sellerPrice}
                                                    </span>
                                                </div>
                                                <div className={`p-2 rounded-xl transition-all ${res.isOutOfStock ? "bg-slate-100 text-slate-400" : "bg-slate-900 text-white group-hover:bg-green-600"}`}>
                                                    {res.isOutOfStock ? <Ban size={16} /> : <ArrowRight size={16} />}
                                                </div>
                                            </div>
                                        )}
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

export default Search;