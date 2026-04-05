import React, { useContext, useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from "axios";
import { faCartShopping, faSearch, faUser, faBars, faXmark, faHeart } from '@fortawesome/free-solid-svg-icons'
import { CategoryContext } from '../context/CategoryContext'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import { Sprout } from 'lucide-react';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [dropdown, setDropdown] = useState(false)
    const [search, setSearch] = useState("")
    const [products, setProducts] = useState([]);

    const [profileOpen, setProfileOpen] = useState(false)
    const [hoverProfile, setHoverProfile] = useState(false)
    const [mobileProfileOpen, setMobileProfileOpen] = useState(false)

    const profileRef = useRef(null)
    const seedsRef = useRef(null) // NEW: reference for seeds dropdown

    const { cart } = useContext(CartContext)
    const { user, logout, token } = useContext(AuthContext)
    const { categories } = useContext(CategoryContext)
    const navigate = useNavigate()

    const totalItems = (cart && cart.length) ? cart.length : 0

    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        const loadWishlistCount = async () => {
            try {
                if (!user || !token) {
                    setWishlistCount(0);
                    return;
                }

                const res = await axios.get("/api/wishlist", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = res.data?.data;
                setWishlistCount(Array.isArray(data) ? data.length : 0);
            } catch (e) {
                setWishlistCount(0);
            }
        };

        loadWishlistCount();
    }, [user, token]);

    const handleLogout = () => {
        if (!window.confirm("Are you sure you want to logout?")) return
        logout()
        closeAll()
        navigate("/login")
    }

    // const handleSearch = () => {
    //     const trimmed = search.trim()
    //     if (!trimmed) return
    //     navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    //     setSearch("")
    // }

    // FIX 1: Correct the variable names to match your state ('search')
    const filteredProducts = products.filter(p => {
        const searchLower = search.toLowerCase(); // Changed from searchTerm to search
        const categoryName = p.categoryId?.name || p.category?.name || "";

        const matchesSearch =
            p.name.toLowerCase().includes(searchLower) ||
            categoryName.toLowerCase().includes(searchLower);

        // If you don't have a 'filterCategory' state, default this to true or remove it
        return matchesSearch;
    });

    // FIX 2: Create a reusable search function
    const handleSearchAction = () => {
        const trimmed = search.trim();
        if (trimmed) {
            navigate(`/search?q=${encodeURIComponent(trimmed)}`);
            // Optional: closeAll(); 
        }
    };

    const closeAll = () => {
        setIsOpen(false)
        setDropdown(false)
        setProfileOpen(false)
        setMobileProfileOpen(false)
    }

    // Click outside handler for profile AND seeds dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false)
            }
            if (seedsRef.current && !seedsRef.current.contains(event.target)) {
                setDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <nav className="bg-gray-900/70 backdrop-blur-lg sticky top-0 z-50 shadow-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4">

                {/* NAVBAR ROW */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between py-2 lg:h-16 gap-2">

                    {/* TOP SECTION: Logo + Cart + Hamburger (Visible on Mobile) */}
                    <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                        <Link
                            to="/home"
                            onClick={closeAll}
                            className="flex items-center gap-3 shrink-0 cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                                <Sprout size={22} strokeWidth={2.5} className="text-white" />
                            </div>

                            <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase text-white leading-none">
                                Seed<span className="text-green-500">Store</span>
                            </h1>
                        </Link>
                        <div className="flex items-center gap-4 lg:hidden">
                            <NavLink to="/cart" className="relative text-gray-300 hover:text-white">
                                <FontAwesomeIcon icon={faCartShopping} />
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.5">
                                        {totalItems}
                                    </span>
                                )}
                            </NavLink>
                            <NavLink to="/wishlist" className="relative text-gray-300 hover:text-white">
                                <FontAwesomeIcon icon={faHeart} />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.5">
                                        {wishlistCount}
                                    </span>
                                )}
                            </NavLink>
                            <button onClick={() => setIsOpen(!isOpen)} className="text-white text-xl">
                                <FontAwesomeIcon icon={isOpen ? faXmark : faBars} />
                            </button>
                        </div>
                    </div>

                    {/* SEARCH BAR */}
                    <div className="w-full lg:flex-1 lg:max-w-md lg:mx-4 order-3 lg:order-0 mt-2 lg:mt-0">
                        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-full overflow-hidden w-full focus-within:ring-1 focus-within:ring-green-500">
                            <input
                                type="text"
                                placeholder="Search seeds, products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                // Use the function here
                                onKeyDown={(e) => e.key === "Enter" && handleSearchAction()}
                                className="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
                            />

                            {search && (
                                <button onClick={() => setSearch("")} className="text-gray-300 hover:text-white px-2">
                                    ✕
                                </button>
                            )}

                            <button
                                onClick={handleSearchAction}
                                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-r-full transition"
                            >
                                <FontAwesomeIcon icon={faSearch} className="text-white" />
                            </button>
                        </div>
                    </div>

                    {/* DESKTOP MENU */}
                    <div className="hidden lg:flex items-center gap-6">

                        <NavLink to="/home" className={({ isActive }) => isActive ? "text-green-500 font-semibold" : "text-gray-300 hover:text-white"}>Home</NavLink>
                        <NavLink to="/about" className={({ isActive }) => isActive ? "text-green-500 font-semibold" : "text-gray-300 hover:text-white"}>About</NavLink>
                        <NavLink to="/contact" className={({ isActive }) => isActive ? "text-green-500 font-semibold" : "text-gray-300 hover:text-white"}>Contact</NavLink>

                        {/* CATEGORY DROPDOWN */}
                        <div className="relative" ref={seedsRef}>
                            <button onClick={() => setDropdown(!dropdown)} className="text-gray-300 hover:text-white">
                                Seeds ▼
                            </button>
                            {dropdown && (
                                <div className="absolute bg-white text-black mt-2 rounded shadow-lg w-52 py-2">
                                    {categories.map((cat) => (
                                        <NavLink
                                            key={cat._id || cat.name}
                                            to={`/category/${cat.name}`}
                                            onClick={closeAll}
                                            className="block px-4 py-2 hover:bg-gray-100"
                                        >
                                            {cat.name} Seeds
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* CART */}
                        <NavLink to="/cart" className="relative text-gray-300 hover:text-white">
                            <FontAwesomeIcon icon={faCartShopping} />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">
                                    {totalItems}
                                </span>
                            )}
                        </NavLink>

                        {/* WISHLIST */}
                        <NavLink to="/wishlist" className="relative text-gray-300 hover:text-white">
                            <FontAwesomeIcon icon={faHeart} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">
                                    {wishlistCount}
                                </span>
                            )}
                        </NavLink>

                        {/* PROFILE */}
                        {user ? (
                            <div className="relative flex items-center gap-2" ref={profileRef} onMouseEnter={() => setHoverProfile(true)} onMouseLeave={() => setHoverProfile(false)}>
                                <button onClick={() => setProfileOpen(!profileOpen)}>
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt="profile" className="w-9 h-9 rounded-full object-cover border border-gray-600" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                                            <FontAwesomeIcon icon={faUser} className="text-white" />
                                        </div>
                                    )}
                                </button>
                                {hoverProfile && <span className="text-white text-sm absolute -bottom-8 bg-black/50 px-2 py-1 rounded whitespace-nowrap">{user.firstname}</span>}
                                {profileOpen && (
                                    <div className="absolute right-0 top-12 w-40 bg-white rounded-lg shadow-lg text-black py-2">
                                        <NavLink to="/profile" onClick={closeAll} className="block px-4 py-2 hover:bg-gray-100">Profile</NavLink>
                                        <NavLink to="/orders" onClick={closeAll} className="block px-4 py-2 hover:bg-gray-100">My Orders</NavLink>
                                        <NavLink to="/wishlist" onClick={closeAll} className="block px-4 py-2 hover:bg-gray-100">Wishlist</NavLink>
                                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <NavLink to="/login" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Login</NavLink>
                        )}
                    </div>
                </div>

                {/* MOBILE MENU LINKS */}
                {isOpen && (
                    <div className="lg:hidden bg-gray-900 border-t border-gray-700 px-2 py-4 space-y-4">
                        <NavLink to="/home" onClick={closeAll} className="block text-gray-300 hover:text-white text-lg px-2">Home</NavLink>
                        <NavLink to="/about" onClick={closeAll} className="block text-gray-300 hover:text-white text-lg px-2">About</NavLink>
                        <NavLink to="/contact" onClick={closeAll} className="block text-gray-300 hover:text-white text-lg px-2">Contact</NavLink>

                        {/* MOBILE CATEGORY DROPDOWN */}
                        <div ref={seedsRef}>
                            <button onClick={() => setDropdown(!dropdown)} className="w-full text-left text-gray-300 hover:text-white text-lg px-2 flex justify-between">
                                Seeds <span>{dropdown ? '▲' : '▼'}</span>
                            </button>
                            {dropdown && (
                                <div className="flex flex-col gap-2 mt-2 pl-6">
                                    {categories.map((cat) => (
                                        <NavLink key={cat._id || cat.name} to={`/category/${cat.name}`} onClick={closeAll} className="text-gray-400 hover:text-white">
                                            {cat.name} Seeds
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* MOBILE USER PROFILE */}
                        {user ? (
                            <div className="pt-4 border-t border-gray-700">
                                <button onClick={() => setMobileProfileOpen(!mobileProfileOpen)} className="flex items-center gap-2 text-gray-300 px-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                        {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <FontAwesomeIcon icon={faUser} />}
                                    </div>
                                    {user.firstname}
                                </button>
                                {mobileProfileOpen && (
                                    <div className="flex flex-col gap-2 mt-3 pl-12">
                                        <NavLink to="/profile" onClick={closeAll} className="text-gray-300">Profile</NavLink>
                                        <NavLink to="/orders" onClick={closeAll} className="text-gray-300">My Orders</NavLink>
                                        <NavLink to="/wishlist" onClick={closeAll} className="text-gray-300">Wishlist</NavLink>
                                        <button onClick={handleLogout} className="text-red-500 text-left">Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <NavLink to="/login" onClick={closeAll} className="block bg-green-600 text-white px-4 py-2 rounded-lg text-center">Login</NavLink>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}