import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Sprout, LogOut, LayoutDashboard, FolderTree, Package, Bell, Menu, X, MapPin, ChevronRight } from "lucide-react";
import { useLocation, NavLink, Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/admin/users", label: "Users", icon: <Sprout size={18} /> },
    { path: "/admin/categories", label: "Category", icon: <FolderTree size={18} /> },
    { path: "/admin/products", label: "Product", icon: <Package size={18} /> },
  ];

  const activeItem = menuItems.find(item => item.path === location.pathname);
  const currentTitle = activeItem ? activeItem.label : "Admin Panel";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/admin/login");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Transition breakpoint shifted from lg to md (768px) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 flex flex-col shadow-2xl
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-linear-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 text-white">
              <Sprout size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-black tracking-tighter italic uppercase">Seed<span className="text-green-500">Store</span></h1>
          </div>

          {user && (
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-sm font-bold border border-slate-600 shadow-inner text-white">
                  {user.firstname?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Admin</p>
                  <p className="text-sm font-bold text-slate-100 truncate">{user.firstname} {user.lastname}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? "bg-green-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`
              }
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100" />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all font-bold text-sm">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen relative">
        <header className="h-16 md:h-20 bg-white border-b border-slate-200/60 flex items-center px-4 md:px-10 justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-3">
            <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="overflow-hidden">
              <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Control Panel</p>
              <h2 className="text-base md:text-2xl font-black text-slate-800 tracking-tight uppercase truncate">
                <span className="text-green-600">{currentTitle}</span>
                <span className="hidden sm:inline"> Management</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3 md:space-x-4 shrink-0">
            {/* FIXED DATE: Ab ye mobile (sabse choti screen) par bhi dikhega */}
            <div className="text-right pr-3 md:pr-4 border-r border-slate-200">
              <p className="text-[10px] md:text-sm font-black text-slate-900 leading-none">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <p className="text-[9px] md:text-[10px] text-green-500 font-bold uppercase mt-1 tracking-tighter">
                System Live
              </p>
            </div>

            <button className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-green-600 transition-all border border-slate-100">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 pb-20">
          <div className="max-w-6xl mx-auto min-h-full">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200/50 p-5 md:p-8 min-h-[65vh]">
              <Outlet />
            </div>
          </div>
        </div>

        {/* FIXED FOOTER - Optimized for Mobile visibility */}
        <footer className="absolute bottom-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-md border-t border-slate-200/60 px-4 md:px-10 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2 shrink-0">
            <p className="text-slate-500 font-bold text-[10px] md:text-[11px] uppercase whitespace-nowrap">
              &copy; {new Date().getFullYear()} <span className="text-slate-900 font-black">SeedStore</span>
            </p>
          </div>

          {/* Address - Always visible now, even on mobile */}
          <div className="flex items-center space-x-1 text-slate-400 overflow-hidden px-2">
            <MapPin size={10} className="text-green-500 shrink-0" />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-tight truncate">
              Gujarat, India
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-2 py-1 bg-green-50 rounded-full border border-green-100 shrink-0">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] md:text-[9px] font-black text-green-700 uppercase">Protected</span>
          </div>
        </footer>
      </main>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
    </div>
  );
};

export default AdminLayout;