import React, { useContext, useState } from 'react'
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { CategoryContext } from '../context/CategoryContext'
import Footer from './Footer'

export const Navbar = () => {

    const [isOpen, setIsOpen] = useState(false)
    const [dropdown, setDropdown] = useState(false)
    const [search, setSearch] = useState("")

    const { categories } = useContext(CategoryContext);
    const navigate = useNavigate()

    // ✅ SEARCH FUNCTION
    const handleSearch = () => {

        const trimmed = search.trim();

        if (!trimmed) return;

        navigate(`/search?q=${encodeURIComponent(trimmed)}`);

        setSearch("");
        closeAll();
    }

    const closeAll = () => {
        setIsOpen(false)
        setDropdown(false)
    }

    return (
        <>
        <nav className="bg-gray-900 sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4">

                {/* Top Navbar */}
                <div className="flex items-center justify-between gap-4 h-16">

                    {/* Logo */}
                    <Link
                        to="/user/home"
                        onClick={closeAll}
                        className="text-white text-2xl font-semibold whitespace-nowrap"
                    >
                        SeedStore
                    </Link>


                    {/* GLOBAL RESPONSIVE SEARCH */}
                    <div className="w-full max-w-sm mx-2">
                        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-full overflow-hidden focus-within:border-green-500 transition">

                            <input
                                type="text"
                                placeholder="Search seeds, products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="w-full bg-transparent text-white px-5 py-2.5 outline-none"
                            />

                            <button
                                onClick={handleSearch}
                                className="bg-green-600 hover:bg-green-700 px-5 py-2.5 transition"
                            >
                                <FontAwesomeIcon icon={faSearch} className="text-white" />
                            </button>

                        </div>
                    </div>


                    {/* Hamburger */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden flex flex-col gap-1"
                    >
                        <span className={`w-6 h-0.5 bg-white transition ${isOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
                        <span className={`w-6 h-0.5 bg-white transition ${isOpen ? "opacity-0" : ""}`}></span>
                        <span className={`w-6 h-0.5 bg-white transition ${isOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
                    </button>


                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-6">

                        <NavLink to="home" className={({ isActive }) =>
                            isActive ? "text-green-500 font-semibold"
                                : "text-gray-300 hover:text-white"
                        }>
                            Home
                        </NavLink>

                        <NavLink to="about" className={({ isActive }) =>
                            isActive ? "text-green-500 font-semibold"
                                : "text-gray-300 hover:text-white"
                        }>
                            About
                        </NavLink>

                         <NavLink to="getapi" className={({ isActive }) =>
                            isActive ? "text-green-500 font-semibold"
                                : "text-gray-300 hover:text-white"
                        }>
                            Getapi
                        </NavLink>

                        <NavLink to="contact" className={({ isActive }) =>
                            isActive ? "text-green-500 font-semibold"
                                : "text-gray-300 hover:text-white"
                        }>
                            Contact
                        </NavLink>


                        {/* Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdown(!dropdown)}
                                className="text-gray-300 hover:text-white"
                            >
                                Categories ▼
                            </button>

                            {dropdown && (
                                <div className="absolute bg-white text-black mt-2 rounded shadow-lg w-52">

                                    {categories.map((cat) => (
                                        <NavLink
                                            key={cat.name}
                                            to={`category/${cat.name}`}
                                            onClick={closeAll}
                                            className={({ isActive }) =>
                                                `block px-4 py-2 hover:bg-gray-100 ${
                                                    isActive ? "text-green-600 font-semibold bg-gray-100" : ""
                                                }`
                                            }
                                        >
                                            {cat.name} Seeds
                                        </NavLink>
                                    ))}

                                </div>
                            )}
                        </div>

                        <NavLink
                            to="/"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                            Login
                        </NavLink>

                    </div>

                </div>


                {/* ✅ MOBILE MENU */}
                {isOpen && (
                    <div className="lg:hidden flex flex-col gap-4 pb-5 pt-4 border-t border-gray-700">

                        <NavLink onClick={closeAll} to="home" className={({ isActive }) =>
                            isActive ? "text-green-500 font-semibold"
                                : "text-gray-300 hover:text-white"}>
                            Home
                        </NavLink>

                        <NavLink onClick={closeAll} to="about" className={({ isActive }) =>
                            isActive ? "text-green-500 font-semibold"
                                : "text-gray-300 hover:text-white"}>
                            About
                        </NavLink>

                        <NavLink onClick={closeAll} to="contact" className={({ isActive }) =>
                            isActive ? "text-green-500 font-semibold"
                                : "text-gray-300 hover:text-white"}>
                            Contact
                        </NavLink>


                        {/* Mobile Dropdown */}
                        <div>
                            <button
                                onClick={() => setDropdown(!dropdown)}
                                className="text-gray-300 hover:text-white w-full text-left"
                            >
                                Categories ▼
                            </button>

                            {dropdown && (
                                <div className="flex flex-col pl-4 mt-2 gap-2 border-l border-gray-700">

                                    {categories.map((cat) => (
                                        <NavLink
                                            key={cat.name}
                                            to={`category/${cat.name}`}
                                            onClick={closeAll}
                                            className={({ isActive }) =>
                                                isActive
                                                    ? "text-green-500 font-semibold"
                                                    : "text-gray-400 hover:text-white"
                                            }
                                        >
                                            {cat.name} Seeds
                                        </NavLink>
                                    ))}

                                </div>
                            )}
                        </div>

                        <NavLink
                            onClick={closeAll}
                            to="/login"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center"
                        >
                            Login
                        </NavLink>

                    </div>
                )}

            </div>
        </nav>
            <Outlet/>
            <Footer/>
        </>

    )
}   