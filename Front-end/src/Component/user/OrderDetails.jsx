import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { Trash2, Save } from "lucide-react";

const API_URL = "http://localhost:5000";

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);

  const isLoggedIn = Boolean(user && (user._id || user.id));

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressErrors, setAddressErrors] = useState({});
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });

  const validateAddress = () => {
    const required = ["fullName", "phone", "addressLine1", "city", "state", "country", "pincode"];
    const nextErrors = {};
    for (const k of required) {
      if (!addressForm[k] || String(addressForm[k]).trim() === "") nextErrors[k] = "Required";
    }
    setAddressErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined;

        const res = await axios.get(`${API_URL}/api/orders/${id}`, config);
        setOrder(res.data?.order || null);
        setItems(Array.isArray(res.data?.items) ? res.data.items : []);

        const addr = res.data?.order?.addressId;
        if (addr) {
          setAddressForm({
            fullName: addr.fullName || "",
            phone: addr.phone || "",
            addressLine1: addr.addressLine1 || "",
            addressLine2: addr.addressLine2 || "",
            city: addr.city || "",
            state: addr.state || "",
            country: addr.country || "India",
            pincode: addr.pincode || "",
          });
        }
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, isLoggedIn, navigate, token]);

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    if (!order?._id) return;

    const ok = validateAddress();
    if (!ok) {
      toast.error("Please fill all required address fields");
      return;
    }

    try {
      setLoading(true);
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const res = await axios.put(
        `${API_URL}/api/orders/${id}/address`,
        { address: addressForm },
        config
      );

      setOrder(res.data?.order || res.data?.order || order);
      toast.success("Address updated");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!itemId) return;
    try {
      setLoading(true);
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const res = await axios.delete(`${API_URL}/api/orders/${id}/items/${itemId}`, config);
      setOrder(res.data?.order || order);
      setItems(Array.isArray(res.data?.items) ? res.data.items : items);
      toast.success("Item removed from order");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 font-bold">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-bold mb-3">Order not found</p>
        <button
          onClick={() => navigate("/orders")}
          className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="bg-white border border-slate-100 rounded-xl px-4 py-2 font-bold text-slate-700 hover:text-green-600"
          >
            Back
          </button>

          <div className="text-right">
            <p className="font-black text-slate-900">
              Order #{order._id?.slice(-6).toUpperCase()}
            </p>
            <p className="text-sm text-slate-500 font-medium">
              Status: {order.orderStatus} • Payment: {order.paymentStatus}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
          <h2 className="text-2xl font-black text-slate-900 mb-4">Items</h2>

          {items.length === 0 ? (
            <p className="text-slate-500 font-medium">No items found for this order.</p>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <div
                  key={it._id}
                  className="flex items-center justify-between gap-4 border border-slate-100 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                      {it.productId?.imagePath ? (
                        <img
                          alt={it.productId?.name}
                          src={
                            it.productId.imagePath.startsWith("http")
                              ? it.productId.imagePath
                              : `${API_URL}/uploads/${it.productId.imagePath}`
                          }
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="text-slate-400 font-bold text-sm">IMG</div>
                      )}
                    </div>

                    <div>
                      <p className="font-black text-slate-900">{it.productId?.name || it.productId?._id}</p>
                      <p className="text-sm text-slate-500 font-medium">
                        Qty: {it.quantity} • Price: ₹{it.price}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-slate-900">₹{it.totalPrice}</p>
                    <button
                      onClick={() => handleDeleteItem(it._id)}
                      className="mt-2 text-red-500 hover:text-red-700 font-bold text-xs"
                    >
                      Delete item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-slate-600 font-medium">Total Amount</p>
            <p className="text-2xl font-black text-green-600">₹{order.totalAmount}</p>
          </div>
        </div>

        <div className="mt-6 bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
          <h2 className="text-2xl font-black text-slate-900 mb-4">Update Delivery Address</h2>

          <form onSubmit={handleUpdateAddress} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Full Name *</label>
                <input
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm((p) => ({ ...p, fullName: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none ${
                    addressErrors.fullName ? "border-red-400" : "border-slate-200"
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Phone *</label>
                <input
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none ${
                    addressErrors.phone ? "border-red-400" : "border-slate-200"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-600">Address Line 1 *</label>
              <input
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm((p) => ({ ...p, addressLine1: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border outline-none ${
                  addressErrors.addressLine1 ? "border-red-400" : "border-slate-200"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-600">Address Line 2</label>
              <input
                value={addressForm.addressLine2}
                onChange={(e) => setAddressForm((p) => ({ ...p, addressLine2: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">City *</label>
                <input
                  value={addressForm.city}
                  onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none ${
                    addressErrors.city ? "border-red-400" : "border-slate-200"
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">State *</label>
                <input
                  value={addressForm.state}
                  onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none ${
                    addressErrors.state ? "border-red-400" : "border-slate-200"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Country *</label>
                <input
                  value={addressForm.country}
                  onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none ${
                    addressErrors.country ? "border-red-400" : "border-slate-200"
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">Pincode *</label>
                <input
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border outline-none ${
                    addressErrors.pincode ? "border-red-400" : "border-slate-200"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={18} />
                Save Address
              </button>
              <button
                type="button"
                onClick={() => {
                  const addr = order?.addressId;
                  if (!addr) return;
                  setAddressForm({
                    fullName: addr.fullName || "",
                    phone: addr.phone || "",
                    addressLine1: addr.addressLine1 || "",
                    addressLine2: addr.addressLine2 || "",
                    city: addr.city || "",
                    state: addr.state || "",
                    country: addr.country || "India",
                    pincode: addr.pincode || "",
                  });
                  setAddressErrors({});
                }}
                className="bg-white border border-slate-200 px-6 py-3 rounded-xl font-black text-slate-700 hover:bg-slate-50 transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

