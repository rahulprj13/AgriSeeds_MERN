import React, { useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="px-6 py-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">SeedStore Admin</h1>
          {user && (
            <p className="text-sm text-gray-300 mt-1">
              Logged in as <span className="font-semibold">{user.firstname}</span>
            </p>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${
                isActive ? "bg-green-600 text-white" : "text-gray-200 hover:bg-gray-800"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${
                isActive ? "bg-green-600 text-white" : "text-gray-200 hover:bg-gray-800"
              }`
            }
          >
            Categories
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${
                isActive ? "bg-green-600 text-white" : "text-gray-200 hover:bg-gray-800"
              }`
            }
          >
            Products
          </NavLink>
        </nav>

        <div className="px-4 py-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

