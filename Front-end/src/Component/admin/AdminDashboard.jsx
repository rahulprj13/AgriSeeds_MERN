import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
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
      
      {/* --- TOP STATS CARDS ONLY --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon="👥" 
          label="Total Users" 
          value={stats.totalUsers ?? 0} 
          color="bg-pink-400" 
        />
        <StatCard 
          icon="📦" 
          label="Total Products" 
          value={stats.totalProducts ?? 0} 
          color="bg-cyan-400" 
        />
        <StatCard 
          icon="🏷️" 
          label="Total Categories" 
          value={stats.totalCategories ?? 0} 
          color="bg-indigo-500" 
        />
      </div>

    </div>
  );
};

/* --- UI SUB-COMPONENT --- */

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-6 transition-all hover:-translate-y-1 hover:shadow-md">
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







// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const AdminDashboard = () => {
//   const [data, setData] = useState({
//     stats: {},
//     orders: [],
//     loading: true,
//   });

//   useEffect(() => {
//     const loadDashboard = async () => {
//       try {
//         const [statsRes, ordersRes] = await Promise.all([
//           axios.get("/api/admin/stats"),
//           axios.get("/api/admin/carts"), // Fetching carts for recent activity
//         ]);

//         setData({
//           stats: statsRes.data || {},
//           orders: Array.isArray(ordersRes.data) ? ordersRes.data : [],
//           loading: false,
//         });
//       } catch (e) {
//         console.error("Dashboard Load Error:", e);
//         setData((prev) => ({ ...prev, loading: false }));
//       }
//     };
//     loadDashboard();
//   }, []);

//   const { stats, orders, loading } = data;

//   if (loading) return <div className="p-10 text-center text-gray-400 font-bold">Syncing Dashboard...</div>;

//   // Logic for Order Status bars
//   const total = orders.length || 1;
//   const getStatusCount = (status) => orders.filter(o => o.status?.toLowerCase() === status.toLowerCase()).length;

//   return (
//     <div className="bg-[#F8F9FD] min-h-screen p-6 font-sans">
      
//       {/* --- TOP STATS CARDS --- */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         <StatCard icon="🛒" label="Total Orders" value={stats.totalCartItems ?? 0} color="bg-indigo-500" />
//         <StatCard icon="👥" label="Total Users" value={stats.totalUsers ?? 0} color="bg-pink-400" />
//         <StatCard icon="📦" label="Total Products" value={stats.totalProducts ?? 0} color="bg-cyan-400" />
//         <StatCard icon="🏷️" label="Total Categories" value={stats.totalCategories ?? 0} color="bg-cyan-400" />
//         <StatCard icon="Rs" label="Total Revenue" value={`₹${(stats.totalRevenue ?? 0).toLocaleString()}`} color="bg-emerald-400" />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* --- RECENT ORDERS --- */}
//         <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//           <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">🕒 Recent Orders</h3>
//           <div className="space-y-1">
//             {orders.length > 0 ? (
//               orders.slice(0, 5).map((order) => (
//                 <OrderRow key={order._id} order={order} />
//               ))
//             ) : (
//               <p className="py-10 text-center text-gray-400">No recent orders found.</p>
//             )}
//           </div>
//         </section>

//         {/* --- ORDER STATUS (Progress Bars) --- */}
//         <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
//           <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">📊 Order Status</h3>
//           <div className="space-y-6">
//             <StatusProgress label="Confirmed" count={getStatusCount("confirmed")} total={total} color="bg-gray-300" />
//             <StatusProgress label="Shipped" count={getStatusCount("shipped")} total={total} color="bg-blue-500" />
//             <StatusProgress label="Delivered" count={getStatusCount("delivered")} total={total} color="bg-cyan-500" />
//             <StatusProgress label="Cancelled" count={getStatusCount("cancelled")} total={total} color="bg-rose-500" />
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// /* --- UI SUB-COMPONENTS --- */

// const StatCard = ({ icon, label, value, color }) => (
//   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4 transition-all hover:translate-y-[-2px]">
//     <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-gray-200`}>
//       {icon}
//     </div>
//     <div>
//       <h2 className="text-2xl font-black text-gray-800 tracking-tight">{value}</h2>
//       <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
//     </div>
//   </div>
// );

// const OrderRow = ({ order }) => {
//   const statusStyles = {
//     shipped: "bg-blue-50 text-blue-500",
//     delivered: "bg-cyan-50 text-cyan-600",
//     cancelled: "bg-rose-50 text-rose-500",
//     confirmed: "bg-gray-50 text-gray-400"
//   };

//   return (
//     <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 px-2">
//       <div>
//         <h4 className="font-bold text-gray-800 text-sm">Order ID: {order._id?.slice(-5).toUpperCase() || "---"}</h4>
//         <p className="text-gray-400 text-[11px] font-medium uppercase tracking-tighter">
//           {order.items?.[0]?.name || "Product"} — {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Date Unavailable"}
//         </p>
//       </div>
//       <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyles[order.status?.toLowerCase()] || statusStyles.confirmed}`}>
//         {order.status}
//       </span>
//     </div>
//   );
// };

// const StatusProgress = ({ label, count, total, color }) => (
//   <div>
//     <div className="flex justify-between items-center mb-1.5">
//       <span className="text-gray-500 font-bold text-xs uppercase tracking-tight">{label}</span>
//       <span className="text-gray-800 font-black text-sm">{count}</span>
//     </div>
//     <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
//       <div 
//         className={`${color} h-full rounded-full transition-all duration-1000 ease-out`} 
//         style={{ width: `${(count / total) * 100}%` }}
//       ></div>
//     </div>
//   </div>
// );

// export default AdminDashboard;