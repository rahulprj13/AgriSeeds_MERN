import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CategoryContext } from "../context/CategoryContext";
import { Sprout } from "lucide-react";

const Footer = () => {
  const { categories } = useContext(CategoryContext);

  return (
    <footer className="bg-gray-900 text-gray-200 pt-10 pb-4 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-4">
            <Link to="/home" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 shrink-0">
                <Sprout size={22} strokeWidth={2.5} className="text-white" />
              </div>

              <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase text-white leading-none">
                Seed<span className="text-green-500">Store</span>
              </h1>
            </Link>

            <p className="text-gray-400 leading-7 max-w-sm">
              Your trusted platform for high-quality seeds and gardening essentials.
              Grow better with us.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h6 className="font-semibold mb-2">Quick Links</h6>

            <ul className="space-y-2">
              <li>
                <Link className="hover:text-white" to="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/about">
                  About
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-3">
            <h6 className="font-semibold mb-2">Categories</h6>

            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat._id}>
                  <Link
                    className="hover:text-white"
                    to={`/category/${cat.name.toLowerCase()}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h6 className="font-semibold mb-2">Contact</h6>
            <p>Email: support@seedstore.com</p>
            <p>Phone: +91 98765 43210</p>
            <p>Location: India</p>
          </div>
        </div>

        <hr className="border-gray-700 my-6" />

        <div className="text-center">
          <p>© {new Date().getFullYear()} SeedStore | All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;