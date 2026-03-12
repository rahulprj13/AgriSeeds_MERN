import React, { useContext, useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faSearch, faUser, faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import { CategoryContext } from '../context/CategoryContext'
import Footer from './Footer'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'

export const Navbar = () => {

    const [isOpen, setIsOpen] = useState(false)
    const [dropdown, setDropdown] = useState(false)
    const [search, setSearch] = useState("")
    const [profileOpen, setProfileOpen] = useState(false)
    const [hoverProfile, setHoverProfile] = useState(false)
    const [mobileProfileOpen, setMobileProfileOpen] = useState(false)

    const profileRef = useRef(null)

    const { cart } = useContext(CartContext)
    const { user, logout } = useContext(AuthContext)
    const { categories } = useContext(CategoryContext)

    const navigate = useNavigate()

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)

    // Logout with confirmation
    const handleLogout = () => {

        const confirmLogout = window.confirm("Are you sure you want to logout?")

        if (!confirmLogout) return

        logout()

        closeAll()

        navigate("/login")

    }

    const handleSearch = () => {

        const trimmed = search.trim()

        if (!trimmed) return

        navigate(`/search?q=${encodeURIComponent(trimmed)}`)

        setSearch("")
    }

    const closeAll = () => {
        setIsOpen(false)
        setDropdown(false)
        setProfileOpen(false)
        setMobileProfileOpen(false)
    }

    // Close dropdown when clicking outside
    useEffect(() => {

        function handleClickOutside(event) {

            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false)
            }

        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }

    }, [])

    return (
        <>

            <nav className="bg-gray-900/70 backdrop-blur-lg sticky top-0 z-50 shadow-md border-b border-white/10">

                <div className="max-w-7xl mx-auto px-4">

                    {/* NAVBAR ROW */}
                    <div className="flex items-center justify-between gap-4 h-16">

                        {/* LOGO */}
                        <Link
                            to="/home"
                            onClick={closeAll}
                            className="text-white text-2xl font-semibold"
                        >
                            SeedStore
                        </Link>

                        {/* SEARCH */}
                        <div className="hidden md:block w-full max-w-sm">

                            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-full overflow-hidden focus-within:border-green-500">

                                <input
                                    type="text"
                                    placeholder="Search seeds..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSearch()
                                    }}
                                    className="w-full bg-transparent text-white px-5 py-2 outline-none"
                                />

                                <button
                                    onClick={handleSearch}
                                    className="bg-green-600 hover:bg-green-700 px-4 py-2"
                                >
                                    <FontAwesomeIcon icon={faSearch} className="text-white" />
                                </button>

                            </div>

                        </div>

                        {/* MOBILE MENU BUTTON */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden text-white text-xl"
                        >

                            <FontAwesomeIcon icon={isOpen ? faXmark : faBars} />

                        </button>

                        {/* DESKTOP MENU */}
                        <div className="hidden lg:flex items-center gap-6">

                            <NavLink to="/home"
                                className={({ isActive }) =>
                                    isActive ? "text-green-500 font-semibold"
                                        : "text-gray-300 hover:text-white"
                                }>
                                Home
                            </NavLink>

                            <NavLink to="/about"
                                className={({ isActive }) =>
                                    isActive ? "text-green-500 font-semibold"
                                        : "text-gray-300 hover:text-white"
                                }>
                                About
                            </NavLink>

                            <NavLink to="/contact"
                                className={({ isActive }) =>
                                    isActive ? "text-green-500 font-semibold"
                                        : "text-gray-300 hover:text-white"
                                }>
                                Contact
                            </NavLink>

                            {/* CATEGORY DROPDOWN */}
                            <div className="relative">

                                <button
                                    onClick={() => setDropdown(!dropdown)}
                                    className="text-gray-300 hover:text-white"
                                >
                                    Seeds ▼
                                </button>

                                {dropdown && (

                                    <div className="absolute bg-white text-black mt-2 rounded shadow-lg w-52">

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
                            <NavLink to="/cart"
                                className="relative text-gray-300 hover:text-white"
                            >

                                <FontAwesomeIcon icon={faCartShopping} />

                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">
                                        {totalItems}
                                    </span>
                                )}

                            </NavLink>

                            {/* PROFILE */}
                            {user ? (

                                <div
                                    className="relative flex items-center gap-2"
                                    ref={profileRef}
                                    onMouseEnter={() => setHoverProfile(true)}
                                    onMouseLeave={() => setHoverProfile(false)}
                                >

                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                    >

                                        {user.profileImage ? (

                                            <img
                                                src={user.profileImage}
                                                alt="profile"
                                                className="w-9 h-9 rounded-full object-cover"
                                            />

                                        ) : (

                                            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">

                                                <FontAwesomeIcon icon={faUser} className="text-white" />

                                            </div>

                                        )}

                                    </button>

                                    {hoverProfile && (
                                        <span className="text-white text-sm">
                                            {user.firstname}
                                        </span>
                                    )}

                                    {profileOpen && (

                                        <div className="absolute right-0 top-12 w-40 bg-white rounded-lg shadow-lg text-black">

                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 hover:bg-gray-100"
                                                onClick={closeAll}
                                            >
                                                Profile
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                                            >
                                                Logout
                                            </button>

                                        </div>

                                    )}

                                </div>

                            ) : (

                                <NavLink
                                    to="/login"
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                                >
                                    Login
                                </NavLink>

                            )}

                        </div>

                    </div>


                    {/* MOBILE MENU */}

                    {isOpen && (

                        <div className="lg:hidden bg-gray-900 border-t border-gray-700 px-6 py-6 space-y-4">

                            <NavLink
                                to="/home"
                                onClick={closeAll}
                                className={({ isActive }) =>
                                    isActive
                                        ? "block text-green-500 font-semibold text-lg"
                                        : "block text-gray-300 hover:text-white text-lg"
                                }
                            >
                                Home
                            </NavLink>

                            <NavLink
                                to="/about"
                                onClick={closeAll}
                                className={({ isActive }) =>
                                    isActive
                                        ? "block text-green-500 font-semibold text-lg"
                                        : "block text-gray-300 hover:text-white text-lg"
                                }
                            >
                                About
                            </NavLink>

                            <NavLink
                                to="/contact"
                                onClick={closeAll}
                                className={({ isActive }) =>
                                    isActive
                                        ? "block text-green-500 font-semibold text-lg"
                                        : "block text-gray-300 hover:text-white text-lg"
                                }
                            >
                                Contact
                            </NavLink>

                            {/* SEEDS DROPDOWN */}

                            <div>

                                <button
                                    onClick={() => setDropdown(!dropdown)}
                                    className="text-gray-300 hover:text-white text-lg"
                                >
                                    Seeds ▼
                                </button>

                                {dropdown && (

                                    <div className="flex flex-col gap-2 mt-2 pl-2">

                                        {categories.map((cat) => (

                                            <NavLink
                                                key={cat._id || cat.name}
                                                to={`/category/${cat.name}`}
                                                onClick={closeAll}
                                                className="text-gray-300 hover:text-white"
                                            >
                                                {cat.name} Seeds
                                            </NavLink>

                                        ))}

                                    </div>

                                )}

                            </div>

                            {/* CART */}

                            <NavLink
                                to="/cart"
                                onClick={closeAll}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 text-lg ${isActive
                                        ? "text-green-500 font-semibold"
                                        : "text-gray-300 hover:text-white"
                                    }`
                                }
                            >

                                <FontAwesomeIcon icon={faCartShopping} />

                                Cart

                                {totalItems > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {totalItems}
                                    </span>
                                )}

                            </NavLink>

                            {/* USER PROFILE */}

                            {user ? (

                                <div className="pt-4 border-t border-gray-700">

                                    <button
                                        onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
                                        className="flex items-center gap-2 text-gray-300 hover:text-white"
                                    >

                                        {user.profileImage ? (

                                            <img
                                                src={user.profileImage}
                                                alt="profile"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />

                                        ) : (

                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                                <FontAwesomeIcon icon={faUser} />
                                            </div>

                                        )}

                                        {user.firstname}

                                    </button>

                                    {mobileProfileOpen && (

                                        <div className="flex flex-col gap-2 mt-3 pl-2">

                                            <NavLink
                                                to="/profile"
                                                onClick={() => {
                                                    closeAll()
                                                    navigate("/profile")
                                                }}
                                                className="text-gray-300 hover:text-white"
                                            >
                                                Profile
                                            </NavLink>

                                            <button
                                                onClick={handleLogout}
                                                className="text-red-500 hover:text-red-400 text-left"
                                            >
                                                Logout
                                            </button>

                                        </div>

                                    )}

                                </div>

                            ) : (

                                <NavLink
                                    to="/login"
                                    onClick={closeAll}
                                    className="block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center"
                                >
                                    Login
                                </NavLink>

                            )}

                        </div>

                    )}

                </div>

            </nav>

            <Outlet />
            <Footer />

        </>
    )
}