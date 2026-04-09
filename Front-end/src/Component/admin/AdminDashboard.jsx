import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Box,
  Layers,
  ShoppingBag,
  CreditCard,
  CalendarDays,
  IndianRupee,
  TrendingUp,
  Wallet,
  BarChart3,
  CheckCircle2,
  Mail,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    stats: {},
    insights: {},
    contactMessages: [],
    loading: true,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, insightsRes, messagesRes] = await Promise.all([
          axios.get("/api/admin/stats"),
          axios.get("/api/admin/dashboard-insights"),
          axios.get("/api/admin/contact"),
        ]);

        setData({
          stats: statsRes?.data || {},
          insights: insightsRes?.data || {},
          contactMessages: Array.isArray(messagesRes?.data)
            ? messagesRes.data
            : Array.isArray(messagesRes?.data?.messages)
            ? messagesRes.data.messages
            : [],
          loading: false,
        });
      } catch (e) {
        console.error("Dashboard Load Error:", e);
        setData((prev) => ({
          ...prev,
          stats: {},
          insights: {},
          contactMessages: [],
          loading: false,
        }));
      }
    };

    loadDashboard();
  }, []);

  const { stats, loading, insights, contactMessages } = data;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const formatNumber = (value) => Number(value) || 0;

  const totalUsers = Number(stats?.totalUsers || 0);
  const totalProducts = Number(stats?.totalProducts || 0);
  const totalCategories = Number(stats?.totalCategories || 0);
  const totalOrders = Number(stats?.totalOrders || 0);
  const totalPayments = Number(stats?.totalPayments || 0);
  const totalPendingPayments = Number(stats?.totalPendingPayments || 0);
  const totalPaidPayments = Number(stats?.totalPaidPayments || 0);
  const totalRevenue = Number(stats?.totalRevenue || 0);
  const monthlyRevenue = Number(stats?.monthlyRevenue || 0);

  const totalMessages = Array.isArray(contactMessages) ? contactMessages.length : 0;
  const unreadMessages = Array.isArray(contactMessages)
    ? contactMessages.filter((m) => m?.status === "Unread").length
    : 0;

  const paidPaymentPercentage =
    totalPayments > 0 ? Math.round((totalPaidPayments / totalPayments) * 100) : 0;

  const monthlyRevenuePercentage =
    totalRevenue > 0
      ? Math.min(Math.round((monthlyRevenue / totalRevenue) * 100), 100)
      : 0;

  const paymentChartData = useMemo(
    () => [
      {
        label: "Pending Payments",
        value: totalPendingPayments,
        color: "bg-amber-500",
      },
      {
        label: "Paid Payments",
        value: totalPaidPayments,
        color: "bg-emerald-500",
      },
      {
        label: "Orders",
        value: totalOrders,
        color: "bg-blue-500",
      },
    ],
    [totalPendingPayments, totalPaidPayments, totalOrders]
  );

  const maxPaymentChartValue = Math.max(
    ...paymentChartData.map((item) => item.value),
    1
  );

  if (loading) {
    return (
      <div className="p-10 text-center font-bold text-gray-400">
        Loading Stats...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-6 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            Overview of users, products, orders, payments, and revenue
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Users className="h-6 w-6 text-white" />}
            label="Total Users"
            value={formatNumber(totalUsers)}
            color="bg-pink-500"
            onClick={() => navigate("/admin/users")}
          />
          <StatCard
            icon={<Box className="h-6 w-6 text-white" />}
            label="Total Products"
            value={formatNumber(totalProducts)}
            color="bg-cyan-500"
            onClick={() => navigate("/admin/products")}
          />
          <StatCard
            icon={<Layers className="h-6 w-6 text-white" />}
            label="Total Categories"
            value={formatNumber(totalCategories)}
            color="bg-indigo-500"
            onClick={() => navigate("/admin/categories")}
          />
          <StatCard
            icon={<Mail className="h-6 w-6 text-white" />}
            label="Total Messages"
            value={formatNumber(totalMessages)}
            extraLabel={`${unreadMessages} Unread`}
            color="bg-emerald-500"
            onClick={() => navigate("/admin/messages")}
          />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
            Top Selling Seeds
          </h2>

          <div className="flex flex-col gap-4 overflow-y-auto pr-2">
            {Array.isArray(insights?.topSellingSeeds) &&
            insights.topSellingSeeds.length > 0 ? (
              insights.topSellingSeeds.map((seed) => {
                const imageSrc = seed?.image?.startsWith("http")
                  ? seed.image
                  : seed?.image?.startsWith("/")
                  ? `http://localhost:5000${seed.image}`
                  : seed?.image
                  ? `http://localhost:5000/uploads/${seed.image}`
                  : "https://placehold.co/100x100?text=No+Img";

                return (
                  <div key={seed?._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                        <img
                          src={imageSrc}
                          alt={seed?.name || "Seed"}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/100x100?text=No+Img";
                          }}
                        />
                      </div>
                      <div>
                        <p className="line-clamp-1 text-sm font-bold text-slate-800">
                          {seed?.name || "N/A"}
                        </p>
                        <p className="text-xs font-medium text-slate-400">
                          {seed?.totalQuantitySold || 0} units
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">
                        ₹{seed?.totalRevenue || 0}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400">No data available</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Orders Overview
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  {formatNumber(totalOrders)}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Total orders placed in the system
                </p>
              </div>

              <button
                onClick={() => navigate("/admin/orders")}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                View Orders
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MiniInfoCard
                icon={<ShoppingBag className="h-5 w-5 text-emerald-600" />}
                title="Total Orders"
                value={formatNumber(totalOrders)}
                bg="bg-emerald-50"
              />
              <MiniInfoCard
                icon={<CalendarDays className="h-5 w-5 text-sky-600" />}
                title="This Month"
                value={formatCurrency(monthlyRevenue)}
                bg="bg-sky-50"
              />
              <MiniInfoCard
                icon={<TrendingUp className="h-5 w-5 text-violet-600" />}
                title="Revenue"
                value={formatCurrency(totalRevenue)}
                bg="bg-violet-50"
              />
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">
                  Monthly Collection Progress
                </p>
                <span className="text-sm font-black text-slate-900">
                  {monthlyRevenuePercentage}%
                </span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-linear-to-r from-sky-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${monthlyRevenuePercentage}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Monthly Revenue</span>
                <span>{formatCurrency(monthlyRevenue)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                  Payment Overview
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  {formatNumber(totalPayments)}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Payment records available in the system
                </p>
              </div>

              <button
                onClick={() => navigate("/admin/payments")}
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                View Payments
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MiniInfoCard
                icon={<CreditCard className="h-5 w-5 text-amber-600" />}
                title="Pending Payments"
                value={formatNumber(totalPendingPayments)}
                bg="bg-amber-50"
              />
              <MiniInfoCard
                icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                title="Paid"
                value={formatNumber(totalPaidPayments)}
                bg="bg-emerald-50"
              />
              <MiniInfoCard
                icon={<IndianRupee className="h-5 w-5 text-violet-600" />}
                title="Revenue"
                value={formatCurrency(totalRevenue)}
                bg="bg-violet-50"
              />
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Payment Success Ratio</p>
                <span className="text-sm font-black text-slate-900">
                  {paidPaymentPercentage}%
                </span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 to-green-600 transition-all duration-500"
                  style={{ width: `${paidPaymentPercentage}%` }}
                />
              </div>

              <div className="mt-4 space-y-3">
                {paymentChartData.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm font-semibold text-slate-600">
                      <span>{item.label}</span>
                      <span className="font-black text-slate-900">{item.value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{
                          width: `${(item.value / maxPaymentChartValue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Wallet className="h-6 w-6 text-white" />}
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            description="Overall earnings collected from all successful payments."
            gradient="from-violet-500 to-fuchsia-500"
            onClick={() => navigate("/admin/payments")}
          />

          <FeatureCard
            icon={<BarChart3 className="h-6 w-6 text-white" />}
            title="Monthly Collection"
            value={formatCurrency(monthlyRevenue)}
            description="Revenue generated during the current month."
            gradient="from-sky-500 to-blue-600"
            onClick={() => navigate("/admin/payments")}
          />

          <FeatureCard
            icon={<IndianRupee className="h-6 w-6 text-white" />}
            title="Paid Payments"
            value={formatNumber(totalPaidPayments)}
            description="Payments successfully completed and recorded."
            gradient="from-emerald-500 to-green-600"
            onClick={() => navigate("/admin/payments")}
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, onClick, extraLabel }) => (
  <div
    onClick={onClick}
    className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
  >
    <div className="flex items-center gap-4">
      <div className={`${color} flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg`}>
        {icon}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black tracking-tight text-slate-800">{value}</h2>
          {extraLabel && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase text-slate-500">
              {extraLabel}
            </span>
          )}
        </div>

        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>
      </div>
    </div>
  </div>
);

const MiniInfoCard = ({ icon, title, value, bg }) => (
  <div className={`rounded-2xl ${bg} p-4`}>
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
      {icon}
    </div>
    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</p>
    <h3 className="mt-1 text-lg font-black text-slate-900">{value}</h3>
  </div>
);

const FeatureCard = ({ icon, title, value, description, gradient, onClick }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer overflow-hidden rounded-3xl bg-linear-to-br ${gradient} p-6 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]`}
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
      {icon}
    </div>
    <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-white/70">
      {title}
    </p>
    <h3 className="mt-2 text-3xl font-black">{value}</h3>
    <p className="mt-3 text-sm font-medium text-white/80">{description}</p>
  </div>
);

export default AdminDashboard;