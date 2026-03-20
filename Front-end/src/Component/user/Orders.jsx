import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

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
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined;
        const res = await axios.get(`${API_URL}/api/orders`, config);
        setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info("Please login first");
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <h1 className="text-3xl font-black text-slate-900 mb-6">My Orders</h1>

        {loading ? (
          <div className="text-slate-500 font-bold">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 font-bold">No orders yet.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-black text-slate-900">
                    Order {order._id?.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-sm text-slate-500 font-medium">
                    Status: {order.orderStatus} • Payment: {order.paymentStatus}
                  </p>
                  <p className="text-sm text-slate-500 font-medium">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">₹{order.totalAmount}</p>
                  <button
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="mt-2 bg-slate-900 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-600"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

