import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { AuthContext } from "../context/AuthContext";
import { X, Save, Truck, MapPin, Package, Clock, CheckCircle, ShoppingBag } from "lucide-react";

const API_URL = "http://localhost:5000";

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const isLoggedIn = Boolean(user && (user._id || user.id));

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const isDelivered = order?.orderStatus?.toLowerCase() === "delivered";
  const isCancelled = order?.orderStatus?.toLowerCase() === "cancelled";
  const isLocked = isCancelled || isDelivered || order?.orderStatus?.toLowerCase() === "shipped";

  // Timeline Logic (Pending removed)
  const steps = ["processing", "shipped", "delivered"];
  const currentStepIndex = steps.indexOf(order?.orderStatus?.toLowerCase());
  const progressPercentage = currentStepIndex === -1 ? 0 : (currentStepIndex / (steps.length - 1)) * 100;

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "shipped": return <Truck className="w-5 h-5 text-blue-600" />;
      case "processing": return <Package className="w-5 h-5 text-indigo-600" />;
      case "cancelled": return <X className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-green-50 border-green-200";
      case "shipped": return "bg-blue-50 border-blue-200";
      case "processing": return "bg-indigo-50 border-indigo-200";
      case "cancelled": return "bg-red-50 border-red-200";
      default: return "bg-slate-50 border-slate-200";
    }
  };

  const toSlug = (value = "") =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const getCategorySlug = (item) => {
    const categoryInfo = item?.productId?.categoryId;
    if (!categoryInfo) return "seeds";
    if (typeof categoryInfo === "object" && categoryInfo.name) return toSlug(categoryInfo.name);
    return toSlug(categoryInfo);
  };

  const getProductSlug = (item) => toSlug(item?.productId?.name || item?.name || "");

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info("Please login first");
      navigate("/login", { replace: true });
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
        const res = await axios.get(`${API_URL}/api/orders/${id}`, config);

        const orderData = res.data?.order || null;
        setOrder(orderData);
        setItems(Array.isArray(res.data?.items) ? res.data.items : []);

        // FIXED: Resetting form with the nested addressId data
        if (orderData?.addressId) {
          reset({
            fullName: orderData.addressId.fullName || "",
            phone: orderData.addressId.phone || "",
            addressLine1: orderData.addressId.addressLine1 || "",
            city: orderData.addressId.city || "",
            state: orderData.addressId.state || "",
            pincode: orderData.addressId.pincode || "",
            country: orderData.addressId.country || "India",
          });
        }
      } catch (e) {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, isLoggedIn, navigate, token, reset]);

  // FIXED: Address Update Logic
  const onAddressSubmit = async (data) => {
    if (isLocked) {
      toast.warning("Address cannot be changed for this order status.");
      return;
    }
    try {
      setLoading(true);
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      // Sending data object directly
      const res = await axios.put(`${API_URL}/api/orders/${id}/address`, { address: data }, config);

      // Update local state so the UI reflects changes immediately
      if (res.data?.order) {
        setOrder(res.data.order);
      }
      toast.success("Address updated successfully");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      setLoading(true);
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const res = await axios.put(`${API_URL}/api/orders/${id}/cancelled`, config);
      setOrder(res.data?.order || order);
      toast.success("Order cancelled");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Cancel failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !order) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400">LOADING...</div>;
  if (!order) return <div className="p-10 text-center font-black">ORDER NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 pt-10">

        <div className="mb-8 flex items-center justify-between">
          <button onClick={() => navigate("/orders")} className="bg-white border-2 rounded-xl px-5 py-2 font-black shadow-sm hover:bg-slate-50 transition">
            ← Back
          </button>
          <div className="text-right">
            <p className="font-black text-2xl uppercase tracking-tight text-slate-900">Order #{order._id?.slice(-6).toUpperCase()}</p>
            <p className="text-xs font-bold text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* --- TRACKING TIMELINE WITH MOVING TRUCK --- */}
        {!isCancelled && (
          <div className="mb-10 bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
            <div className="relative flex justify-between items-center w-full px-4">
              <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>

              <div
                className="absolute top-1/2 left-8 h-1.5 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out rounded-full"
                style={{ width: `calc(${progressPercentage}% - 16px)` }}
              >
                <div className="absolute right-[-18px] top-[-32px] bg-indigo-600 text-white p-2 rounded-lg shadow-lg border-2 border-white">
                  <Truck size={18} />
                </div>
              </div>

              {steps.map((step, idx) => {
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted ? "bg-indigo-600 border-indigo-100 text-white" : "bg-white border-slate-100 text-slate-300"
                      }`}>
                      {isCompleted ? <CheckCircle size={20} /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                    </div>
                    <p className={`mt-4 font-black text-[10px] uppercase tracking-widest ${isCurrent ? "text-indigo-600" : "text-slate-400"}`}>
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className={`mb-8 border-2 rounded-3xl p-6 shadow-sm ${getStatusColor(order.orderStatus)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(order.orderStatus)}
              <h2 className="text-2xl font-black uppercase text-slate-900">{order.orderStatus}</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">Payment Status</p>
              <p className="font-black text-slate-900 uppercase">{order.paymentStatus}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* Items */}
            <div className="bg-white border rounded-3xl p-6 shadow-sm">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 border-b pb-4"><Package size={22} className="text-slate-400" /> Items Ordered</h3>
              <div className="space-y-4">
                {items.map((it) => (
                  <div key={it._id} className="flex items-center gap-4 p-4 border-2 border-slate-50 rounded-2xl group transition-all hover:border-indigo-100">
                    {/* Product Image with Link */}
                    <img
                      onClick={() => {
                        if (!it.productId?._id) return;
                        const categorySlug = getCategorySlug(it);
                        const productSlug = getProductSlug(it);
                        navigate(`/category/${categorySlug}/${productSlug}/${it.productId._id}`);
                      }}
                      className="w-24 h-24 rounded-2xl object-cover bg-slate-100 cursor-pointer hover:scale-105 transition-transform duration-300"
                      src={it.productId?.imagePath?.startsWith("http") ? it.productId.imagePath : `${API_URL}/uploads/${it.productId?.imagePath}`}
                      alt={it.productId?.name}
                    />

                    <div className="flex-1">
                      {/* Product Name with Link */}
                      <p
                        onClick={() => {
                          if (!it.productId?._id) return;
                          const categorySlug = getCategorySlug(it);
                          const productSlug = getProductSlug(it);
                          navigate(`/category/${categorySlug}/${productSlug}/${it.productId._id}`);
                        }}
                        className="font-black text-slate-900 text-lg cursor-pointer hover:text-indigo-600 transition-colors inline-block"
                      >
                        {it.productId?.name}
                      </p>
                      <p className="text-sm font-bold text-slate-400 mt-1">
                        Quantity: {it.quantity} × ₹{it.price}
                      </p>
                    </div>

                    <p className="font-black text-xl text-slate-900">
                      ₹{it.totalPrice.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Form */}
            <div className="bg-white border rounded-3xl p-6 shadow-sm">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 border-b pb-4"><MapPin size={22} className="text-slate-400" /> Shipping Address</h3>
              <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name</label>
                    <input {...register("fullName", { required: "Name is required" })} disabled={isLocked} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Phone Number</label>
                    <input {...register("phone", { required: true })} disabled={isLocked} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Street Address</label>
                  <input {...register("addressLine1", { required: true })} disabled={isLocked} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold mt-1" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <input placeholder="City" {...register("city", { required: true })} disabled={isLocked} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold" />
                  <input placeholder="State" {...register("state", { required: true })} disabled={isLocked} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold" />
                  <input placeholder="Pincode" {...register("pincode", { required: true })} disabled={isLocked} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold" />
                  <input placeholder="Country" {...register("country", { required: true })} disabled={isLocked} className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold" />
                </div>
                {!isLocked && (
                  <button type="submit" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg">
                    <Save size={20} /> Save Changes
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-6">
            <div className="bg-white border rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-lg font-black mb-6 text-slate-900">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between font-bold text-slate-400"><span>Subtotal</span><span className="text-slate-900">₹{order.totalAmount?.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-slate-400"><span>Shipping</span><span className="text-green-600">FREE</span></div>
                <div className="pt-6 border-t-2 border-slate-50 flex justify-between items-end">
                  <span className="font-black text-slate-900">Total</span>
                  <span className="text-3xl font-black text-indigo-600">₹{order.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {!isCancelled && !isDelivered && (
              <button onClick={handleCancelOrder} className="w-full py-5 rounded-[1.5rem] bg-red-50 text-red-600 font-black border-2 border-red-100 hover:bg-red-600 hover:text-white transition-all">
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;