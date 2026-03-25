import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, Save } from "lucide-react";

const API_URL = "http://localhost:5000";

const AdminOrderItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Use admin-specific endpoint for order details
      const res = await axios.get(`${API_URL}/api/admin/orders/${id}`, config);
      console.log("Admin Order Details:", res.data);
      
      setOrder(res.data?.order || null);
      setItems(Array.isArray(res.data?.items) ? res.data.items : []);
      
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/api/admin/orders/${id}`, { orderStatus: newStatus }, config);
      setOrder(prev => ({ ...prev, orderStatus: newStatus }));
      toast.success("Order status updated");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/api/admin/orders/${id}`, { paymentStatus: newStatus }, config);
      setOrder(prev => ({ ...prev, paymentStatus: newStatus }));
      toast.success("Payment status updated");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
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

  if (loading) return <div className="p-10 text-center text-gray-400 font-bold">Loading Order Details...</div>;

  if (!order) return <div className="p-10 text-center text-gray-400 font-bold">Order not found</div>;

  return (
    <div className="bg-[#F8F9FD] min-h-screen p-6 font-sans">
      <h3></h3>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Order Details</h1>
            <p className="text-sm text-slate-500 font-medium">Order #{order._id}</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Order Status
            </h3>
            <select
              value={order.orderStatus || 'processing'}
              onChange={(e) => updateOrderStatus(e.target.value)}
              disabled={updating}
              className={`w-full px-4 py-2 text-sm font-medium rounded-xl border ${getOrderStatusStyle(order.orderStatus)} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Payment Status
            </h3>
            <select
              value={order.paymentStatus || 'pending'}
              onChange={(e) => updatePaymentStatus(e.target.value)}
              disabled={updating}
              className={`w-full px-4 py-2 text-sm font-medium rounded-xl ${getPaymentStatusStyle(order.paymentStatus)} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Delivery Status & Timeline */}
        {(() => {
          const calcEstimatedDelivery = (createdDate) => {
            const d = new Date(createdDate);
            d.setDate(d.getDate() + 5);
            return d;
          };
          const estimatedDelivery = order.expectedDelivery ? new Date(order.expectedDelivery) : calcEstimatedDelivery(order.createdAt);
          const isDelivered = order.orderStatus?.toLowerCase() === 'delivered';
          return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Status & Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-slate-600 text-xs font-semibold uppercase mb-2">Order Placed</p>
                  <p className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-slate-600 text-xs font-semibold uppercase mb-2">Expected Delivery</p>
                  <p className="font-medium text-indigo-600">{estimatedDelivery.toLocaleDateString()}</p>
                  {!order.expectedDelivery && <p className="text-xs text-slate-500 italic">(estimated)</p>}
                </div>
                <div className={`p-4 rounded-lg border ${isDelivered ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}` }>
                  <p className="text-slate-600 text-xs font-semibold uppercase mb-2">{isDelivered ? 'Delivered On' : 'Current Status'}</p>
                  <p className={`font-medium ${isDelivered ? 'text-green-600' : 'text-yellow-600'} capitalize`}>
                    {isDelivered ? new Date(order.updatedAt).toLocaleDateString() : order.orderStatus || 'In Transit'}
                  </p>
                  {isDelivered && <p className="text-xs text-slate-500">{new Date(order.updatedAt).toLocaleTimeString()}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                {order.courier && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-slate-600 text-xs font-semibold uppercase mb-2">Courier</p>
                    <p className="font-medium text-slate-900">{order.courier}</p>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-slate-600 text-xs font-semibold uppercase mb-2">Tracking Number</p>
                    <p className="font-medium text-slate-900 break-all">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Order Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Order ID: <span className="font-medium text-slate-900">#{order._id}</span></p>
              <p className="text-slate-600">Date: <span className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleString()}</span></p>
            </div>
            <div>
              <p className="text-slate-600">Total Amount: <span className="font-medium text-slate-900">₹{order.totalAmount}</span></p>
              <p className="text-slate-600">Items: <span className="font-medium text-slate-900">{items.length}</span></p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Customer Information</h3>
          <div className="text-sm text-slate-600">
            <p>Name: {order.userId?.firstname && order.userId?.lastname ? `${order.userId.firstname} ${order.userId.lastname}` : 'N/A'}</p>
            <p>Email: {order.userId?.email || 'N/A'}</p>
            {order.userId?.mobile && <p>Phone: {order.userId.mobile}</p>}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <img
                  src={item.productId?.imagePath ? 
                    (item.productId.imagePath.startsWith('http') ? item.productId.imagePath : `${API_URL}/uploads/${item.productId.imagePath}`) 
                    : 'https://via.placeholder.com/80'
                  }
                  alt={item.productId?.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{item.productId?.name}</h4>
                  <p className="text-sm text-slate-600">Category: {item.productId?.categoryId?.name || 'N/A'}</p>
                  <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                  <p className="text-sm text-slate-600">Unit Price: ₹{item.price}</p>
                  <p className="text-sm font-medium text-slate-900">Subtotal: ₹{item.quantity * item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        {order.addressId && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Shipping Address</h3>
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-900">{order.addressId.fullName}</p>
              <p>{order.addressId.addressLine1}</p>
              {order.addressId.addressLine2 && <p>{order.addressId.addressLine2}</p>}
              <p>{order.addressId.city}, {order.addressId.state} {order.addressId.pincode}</p>
              <p>{order.addressId.country}</p>
              <p>Phone: {order.addressId.phone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderItem;