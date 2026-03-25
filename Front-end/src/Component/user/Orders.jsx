import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { ArrowLeft, Package, ChevronRight, Clock } from "lucide-react";

const API_URL = "http://localhost:5000";

const Orders = () => {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const isLoggedIn = Boolean(user && (user._id || user.id));

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
        const res = await axios.get(`${API_URL}/api/orders`, config);
        // Ensure your backend uses .populate('items.productId') to see the name/image
        setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, token]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      case "processing": return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 pt-8">

        {/* Modern Header with Back Button */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Orders</h1>
            <p className="text-sm text-slate-500 font-medium">Manage and track your recent purchases</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 italic text-slate-400">Loading your history...</div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const firstItem = order.items?.[0];
              const product = firstItem?.productId;
              const hasMore = order.items?.length > 1;

              return (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="group bg-white border border-slate-200 rounded-[2rem] p-5 flex flex-col sm:flex-row items-center gap-6 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all cursor-pointer"
                >
                  {/* Product Image Wrapper */}
                  <div className="relative h-24 w-24 flex-shrink-0">
                    <div className="h-full w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                      {product?.imagePath ? (
                        

                        <img
                          src={
                            product?.imagePath?.startsWith("http")
                              ? product.imagePath
                              : `${API_URL}/uploads/${product?.imagePath}`
                          }
                          alt={product?.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center"><Package className="text-slate-300" /></div>
                      )}
                    </div>
                    {hasMore && (
                      <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
                        +{order.items.length - 1} More
                      </div>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <span className="text-xs font-bold text-slate-400">#{order._id.slice(-6).toUpperCase()}</span>
                    </div>

                    <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors truncate max-w-[280px]">
                      {product?.name || "Multiple Items Order"}
                    </h3>

                    <p className="text-xs text-slate-500 font-bold flex items-center justify-center sm:justify-start gap-1">
                      <Clock className="w-3 h-3" />
                      Ordered on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="w-full sm:w-auto flex sm:flex-col items-center justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-50">
                    <div className="sm:text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Amount Paid</p>
                      <p className="text-2xl font-black text-slate-900">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                      <ChevronRight className="w-5 h-5" />
                    </div>
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

export default Orders;