import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Box,
  Layers,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  CalendarDays,
  DollarSign,
  IndianRupee,
  TrendingUp,
  Wallet,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount ?? 0);

  const formatNumber = (value) => value ?? 0;

  const totalUsers = Number(stats.totalUsers || 0);
  const totalProducts = Number(stats.totalProducts || 0);
  const totalCategories = Number(stats.totalCategories || 0);
  const totalCartItems = Number(stats.totalCartItems || 0);
  const totalOrders = Number(stats.totalOrders || 0);
  const totalPayments = Number(stats.totalPayments || 0);
  const totalPendingPayments = Number(stats.totalPendingPayments || 0);
  const totalPaidPayments = Number(stats.totalPaidPayments || 0);
  const totalRevenue = Number(stats.totalRevenue || 0);
  const monthlyRevenue = Number(stats.monthlyRevenue || 0);

  const paidPaymentPercentage =
    totalPayments > 0 ? Math.round((totalPaidPayments / totalPayments) * 100) : 0;

    
  const pendingPaymentPercentage =
    totalPayments > 0 ? Math.round((totalPendingPayments / totalPayments) * 100) : 0;

  const monthlyRevenuePercentage =
    totalRevenue > 0 ? Math.min(Math.round((monthlyRevenue / totalRevenue) * 100), 100) : 0;

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
    [totalPayments, totalPaidPayments, totalOrders]
  );

  const maxPaymentChartValue = Math.max(...paymentChartData.map((item) => item.value), 1);

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

        {/* Top Stat Cards */}
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
            icon={<ShoppingCart className="h-6 w-6 text-white" />}
            label="Total Cart Items"
            value={formatNumber(totalCartItems)}
            color="bg-orange-500"
            onClick={() => navigate("/admin/carts")}
          />
        </div>

        {/* Orders + Payments Highlight Cards */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Order Overview */}
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

          {/* Payment Overview */}
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

        {/* Bottom Revenue Cards */}
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

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
  >
    <div className="flex items-center gap-4">
      <div
        className={`${color} flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg`}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-800">{value}</h2>
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