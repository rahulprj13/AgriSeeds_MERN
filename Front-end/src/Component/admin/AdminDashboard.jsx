import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { Users, Box, Layers, ShoppingCart, ShoppingBag } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [data, setData] = useState({
    stats: {},
    loading: true,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const statsRes = await axios.get("/api/admin/stats");

        setData({
          stats: statsRes.data || {},
          loading: false,
        });
      } catch (e) {
        console.error("Dashboard Load Error:", e);
        setData((prev) => ({ ...prev, loading: false }));
      }
    };
    loadDashboard();
  }, []);

  const { stats, loading } = data;

  if (loading) return <div className="p-10 text-center text-gray-400 font-bold">Loading Stats...</div>;

  return (
    <div className="bg-[#F8F9FD] min-h-screen p-6 font-sans">
      
      {/* --- TOP STATS CARDS WITH NAVIGATION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

        <StatCard 
          icon={<Users className="w-6 h-6 text-white" />} 
          label="Total Users" 
          value={stats.totalUsers ?? 0} 
          color="bg-pink-400" 
          onClick={() => navigate("/admin/users")} // Link added
        />
        <StatCard 
          icon={<Box className="w-6 h-6 text-white" />} 
          label="Total Products" 
          value={stats.totalProducts ?? 0} 
          color="bg-cyan-400" 
          onClick={() => navigate("/admin/products")} // Link added
        />
        <StatCard 
          icon={<Layers className="w-6 h-6 text-white" />} 
          label="Total Categories" 
          value={stats.totalCategories ?? 0} 
          color="bg-indigo-500" 
          onClick={() => navigate("/admin/categories")} // Link added
        />
        <StatCard 
          icon={<ShoppingCart className="w-6 h-6 text-white" />} 
          label="Total Cart-Items" 
          value={stats.totalCartItems ?? 0} 
          color="bg-amber-500" 
          onClick={() => navigate("/admin/carts")} // Link added
        />
        <StatCard 
          icon={<ShoppingBag className="w-6 h-6 text-white" />} 
          label="Total Orders" 
          value={stats.totalOrders ?? 0} 
          color="bg-emerald-500" 
          onClick={() => navigate("/admin/orders")} // Link added
        />
      </div>
    </div>
  );
};


/* --- UI SUB-COMPONENT --- */

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div 
    onClick={onClick} // Click event added
    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-6 transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer active:scale-95"
  >
    <div className={`${color} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-gray-200`}>
      {icon}
    </div>
    <div>
      <h2 className="text-3xl font-black text-gray-800 tracking-tight">{value}</h2>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{label}</p>
    </div>
  </div>
);

export default AdminDashboard;

