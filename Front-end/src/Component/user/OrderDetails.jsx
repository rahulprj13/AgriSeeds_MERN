import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form"; // Import useForm
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { Save, ChevronLeft, Package, MapPin, XCircle, RefreshCcw, AlertCircle } from "lucide-react";

const API_URL = "http://localhost:5000";

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = Boolean(user && (user._id || user.id));

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: "",
      phone: "",
      addressLine1: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    },
  });

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      case "processing": return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const paymentStatusStyle = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case "failed": return "bg-red-100 text-red-700 border-red-200";
      case "pending": return "bg-blue-100 text-blue-700 border-blue-200";
      case "paid": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

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
        const res = await axios.get(`${API_URL}/api/orders/${id}/details`, config);
        const orderData = res.data?.order || null;

        setOrder(orderData);
        setItems(Array.isArray(res.data?.items) ? res.data.items : []);

        // Reset useForm with fetched address data
        const addr = res.data?.order?.addressId;
        if (addr) {
          reset({
            fullName: addr.fullName || "",
            phone: addr.phone || "",
            addressLine1: addr.addressLine1 || "",
            city: addr.city || "",
            state: addr.state || "",
            country: addr.country || "India",
            pincode: addr.pincode || "",
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

  // Handle Form Submission
  const onUpdateAddress = async (data) => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const res = await axios.put(`${API_URL}/api/orders/${id}/address`, { address: data }, config);
      setOrder(res.data?.order || order);
      toast.success("Address updated successfully");
    } catch (e) {
      toast.error("Failed to update address");
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      setLoading(true);
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const res = await axios.put(`${API_URL}/api/orders/${id}/status`, { orderStatus: "cancelled" }, config);
      
      // Update local state with cancelled status
      setOrder(res.data?.order || { ...order, orderStatus: "cancelled" });
      
      toast.success("Order has been cancelled");
      setTimeout(() => navigate("/orders", { replace: true }), 1500);
    } catch (e) {
      toast.error("Failed to cancel order");
      setLoading(false);
    }
  };

  if (loading && !order) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Loading...</div>;
  if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Navbar Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/orders")} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={24} className="text-slate-700" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">Order Details</h1>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">ID: {order._id}</p>
            </div>
          </div>
          {order?.orderStatus?.toLowerCase() !== "cancelled" && order?.orderStatus?.toLowerCase() !== "delivered" && (
            <button onClick={handleCancelOrder} className="flex items-center gap-2 bg-white border-2 border-red-100 text-red-600 px-4 py-2 rounded-xl font-black text-sm hover:bg-red-50 transition-all">
              <XCircle size={18} /> Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Order Items Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3"><Package className="text-blue-500" size={24} /><h2 className="text-xl font-black text-slate-900">Order Items</h2></div>
                <div className="flex flex-wrap items-center gap-6">
                  {/* Order Status Group */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-tighter">
                      Order
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all ${getStatusStyle(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Divider Line (Visible on desktop) */}
                  <div className="hidden md:block w-px h-4 bg-slate-200"></div>

                  {/* Payment Status Group */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-tighter">
                      Payment
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all ${paymentStatusStyle(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-2">
                {items.map((it) => (
                  
                  <div key={it._id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors rounded-[2rem]">

                    <div className="flex items-center gap-6">
                      <Link to={`/category/${it.productId.categoryId?.name}/${it.productId?.name}/${it.productId?._id}`} className="w-24 h-24 rounded-3xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center group">
                        {it.productId?.imagePath ? (
                          <img alt={it.productId?.name} src={it.productId.imagePath.startsWith("http") ? it.productId.imagePath : `${API_URL}/uploads/${it.productId.imagePath}`} className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform" />
                        ) : (
                          <div className="text-slate-400 font-black">IMG</div>
                        )}
                      </Link>
                      <div>
                        <Link to={`/category/${it.productId.categoryId?.name}/${it.productId?.name}/${it.productId?._id}`} className="text-lg font-black text-slate-900 hover:text-blue-600 transition-colors">{it.productId?.name || "Product Name"}</Link>
                        <p className="text-slate-500 font-bold mt-1">Qty: <span className="text-slate-900">{it.quantity}</span><span className="mx-3 text-slate-200">|</span>Price: <span className="text-slate-900">₹{it.price}</span></p>
                      </div>
                    </div>
                    <div className="text-right font-black text-xl text-slate-900">₹{it.totalPrice}</div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-slate-900 flex justify-between items-center mt-4">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Total Amount</span>
                <span className="text-3xl font-black text-white">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Sidebar Address Form with react-hook-form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 sticky top-28">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center text-green-600"><MapPin size={22} /></div>
                <h2 className="text-xl font-black text-slate-900">Shipping To</h2>
              </div>

              <form onSubmit={handleSubmit(onUpdateAddress)} className="space-y-4">
                {/* Show message if order is cancelled */}
                {order?.orderStatus?.toLowerCase() === "cancelled" && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                    <p className="text-red-700 font-bold text-sm">This order has been cancelled and cannot be edited.</p>
                  </div>
                )}
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Full Name</label>
                  <input
                    {...register("fullName", { required: "Name is required", minLength: { value: 3, message: "Too short" } })}
                    className={`w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all font-bold ${errors.fullName ? 'border-red-200 bg-red-50' : 'border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-100'}`}
                  />
                  {errors.fullName && <p className="text-red-500 text-[10px] font-black flex items-center gap-1 ml-1 mt-1 uppercase"><AlertCircle size={12} /> {errors.fullName.message}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Phone</label>
                  <input
                    {...register("phone", {
                      required: "Phone is required",
                      pattern: { value: /^[6-9]\d{9}$/, message: "Invalid 10-digit number" }
                    })}
                    className={`w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all font-bold ${errors.phone ? 'border-red-200 bg-red-50' : 'border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-100'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] font-black flex items-center gap-1 ml-1 mt-1 uppercase"><AlertCircle size={12} /> {errors.phone.message}</p>}
                </div>

                {/* Address Line 1 */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Address</label>
                  <input
                    {...register("addressLine1", { required: "Address is required" })}
                    className={`w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all font-bold ${errors.addressLine1 ? 'border-red-200 bg-red-50' : 'border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-100'}`}
                  />
                  {errors.addressLine1 && <p className="text-red-500 text-[10px] font-black flex items-center gap-1 ml-1 mt-1 uppercase"><AlertCircle size={12} /> {errors.addressLine1.message}</p>}
                </div>

                {/* City & Pincode Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">City</label>
                    <input
                      {...register("city", { required: "Required" })}
                      className={`w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all font-bold text-sm ${errors.city ? 'border-red-200 bg-red-50' : 'border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-100'}`}
                    />
                    {errors.city && <p className="text-red-500 text-[10px] font-black mt-1 uppercase">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Pincode</label>
                    <input
                      {...register("pincode", {
                        required: "Required",
                        pattern: { value: /^\d{6}$/, message: "6 digits only" }
                      })}
                      className={`w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all font-bold text-sm ${errors.pincode ? 'border-red-200 bg-red-50' : 'border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-100'}`}
                    />
                    {errors.pincode && <p className="text-red-500 text-[10px] font-black mt-1 uppercase">{errors.pincode.message}</p>}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || order?.orderStatus?.toLowerCase() === "cancelled"}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={20} /> Update
                  </button>
                  <button
                    type="button"
                    onClick={() => reset()}
                    disabled={order?.orderStatus?.toLowerCase() === "cancelled"}
                    className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Reset to original"
                  >
                    <RefreshCcw size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;