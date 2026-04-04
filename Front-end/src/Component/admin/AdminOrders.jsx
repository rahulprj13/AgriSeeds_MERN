import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import {
  Eye,
  Package,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const AdminOrders = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_URL}/api/admin/orders`, config);
      setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}`,
        { orderStatus: newStatus },
        config
      );
      toast.success("Order status updated");
      fetchOrders();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update status");
    }
  };

  const getOrderStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return orders;

    return orders.filter((order) => {
      const shortId = order._id?.slice(-10)?.toLowerCase() || "";
      const fullId = order._id?.toLowerCase() || "";
      const customerName = order.userId?.name?.toLowerCase() || "";
      const customerEmail = order.userId?.email?.toLowerCase() || "";
      const orderStatus = order.orderStatus?.toLowerCase() || "";
      const paymentStatus = order.paymentStatus?.toLowerCase() || "";
      const totalAmount = String(order.totalAmount || "").toLowerCase();

      return (
        shortId.includes(search) ||
        fullId.includes(search) ||
        customerName.includes(search) ||
        customerEmail.includes(search) ||
        orderStatus.includes(search) ||
        paymentStatus.includes(search) ||
        totalAmount.includes(search)
      );
    });
  }, [orders, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, orders]);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPaginationPages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  const paginationPages = getPaginationPages();

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-400 font-bold">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="p-1 md:p-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingCart className="text-green-600" /> ORDERS
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Order Management System
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by order id, customer, status, payment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-green-500/10"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Sr. No.
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Order ID
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Customer
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Items
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Total
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Order Status
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Payment Status
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Date
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {currentOrders.map((order, index) => (
                <tr
                  key={order._id}
                  className="hover:bg-slate-50/80 transition-all group"
                >
                  <td className="px-6 py-4 text-center font-black text-slate-600">
                    {startIndex + index + 1}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-800">
                      #{order._id.slice(-10)}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-800">
                      {order.userId?.firstname || "N/A"}
                      {order.userId?.lastname || "N/A"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                      {order.userId?.email || "No email"}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-center font-black text-slate-600">
                    {order.items?.length || 0}
                  </td>

                  <td className="px-6 py-4 text-center font-black text-slate-800">
                    ₹{order.totalAmount || 0}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <select
                      value={order.orderStatus || "processing"}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getOrderStatusStyle(
                        order.orderStatus
                      )}`}
                    >
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${getPaymentStatusStyle(
                        order.paymentStatus
                      )}`}
                    >
                      {(order.paymentStatus || "pending").charAt(0).toUpperCase() +
                        (order.paymentStatus || "pending").slice(1)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center text-sm font-bold text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
              No orders found
            </div>
          )}
        </div>

        {filteredOrders.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm md:flex-row">
            <p className="text-sm font-medium text-gray-500">
              Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-gray-700">
                {Math.min(endIndex, filteredOrders.length)}
              </span>{" "}
              of <span className="font-bold text-gray-700">{filteredOrders.length}</span> orders
            </p>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>

              {paginationPages.map((page, index) =>
                page === "..." ? (
                  <span
                    key={`dots-${index}`}
                    className="px-2 text-sm font-bold text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition ${
                      currentPage === page
                        ? "bg-green-600 text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;