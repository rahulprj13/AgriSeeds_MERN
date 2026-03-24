import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { Eye, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const AdminOrders = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_URL}/api/admin/orders`, config);
      setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
      console.log(res);
      
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/api/admin/orders/${orderId}`, { orderStatus: newStatus }, config);
      toast.success("Order status updated");
      fetchOrders(); // Refresh list
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update status");
    }
  };

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/api/admin/orders/${orderId}`, { paymentStatus: newStatus }, config);
      toast.success("Payment status updated");
      fetchOrders(); // Refresh list
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update status");
    }
  };

  const getOrderStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      case "shipped": return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "failed": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400 font-bold">Loading Orders...</div>;

  return (
    <div className="bg-[#F8F9FD] min-h-screen p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Admin Orders</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Order Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Payment Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">#{order._id.slice(-8)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {order.userId?.name || order.userId?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-semibold">
                      ₹{order.totalAmount || 0}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.orderStatus || 'processing'}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getOrderStatusStyle(order.orderStatus)}`}
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.paymentStatus || 'pending'}
                        onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getPaymentStatusStyle(order.paymentStatus)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {orders.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;