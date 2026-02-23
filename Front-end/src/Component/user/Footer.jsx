import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CategoryContext } from "../context/CategoryContext";

const Footer = () => {
  const { categoryData } = useContext(CategoryContext)
  
  return (
    <footer className="bg-gray-900 text-gray-200 pt-10 pb-4 mt-12">
      <div className="max-w-7xl mx-auto px-4">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">

          {/* Company Info */}
          <div className="lg:col-span-4">
            <h5 className="text-green-500 text-lg font-semibold mb-2">
              SeedStore
            </h5>
            <p>
              Your trusted platform for high-quality seeds
              gardening essentials. Grow better with us
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h6 className="font-semibold mb-2">Quick Links</h6>
            <ul className="space-y-2">
              <li>
                <Link className="text-gray-200 hover:text-white no-underline" to="home">
                  Home
                </Link>
              </li>
              <li>
                <Link className="text-gray-200 hover:text-white no-underline" to="about">
                  About
                </Link>
              </li>
              <li>
                <Link className="text-gray-200 hover:text-white no-underline" to="contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-3">
            <h6 className="font-semibold mb-2">Categories</h6>

            <ul className="space-y-2">

              {Object.keys(categoryData).map((key) => (
                <li key={key}>
                  <Link
                    className="text-gray-200 hover:text-white no-underline"
                    to={`category/${key}`}
                  >
                    {categoryData[key].title}
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

        {/* Bottom Line */}
        <hr className="border-gray-700 my-6" />

        <div className="text-center">
          <p className="mb-0">
            © {new Date().getFullYear()} SeedStore | All Rights Reserved
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;