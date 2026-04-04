import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CreditCard, Search } from "lucide-react";

const AdminPayment = () => {
  const [data, setData] = useState({
    payments: [],
    loading: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 10;

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const paymentsRes = await axios.get("/api/admin/payments");

        setData({
          payments: paymentsRes.data.data || [],
          loading: false,
        });
      } catch (e) {
        console.error("Payments Load Error:", e);
        setData((prev) => ({ ...prev, loading: false }));
      }
    };
    loadPayments();
  }, []);

  const { payments, loading } = data;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount ?? 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const filteredPayments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return payments;

    return payments.filter((payment) => {
      const paymentId = payment._id?.toLowerCase() || "";
      const firstName = payment.userId?.firstname?.toLowerCase() || "";
      const lastName = payment.userId?.lastname?.toLowerCase() || "";
      const email = payment.userId?.email?.toLowerCase() || "";
      const method = payment.paymentMethod?.toLowerCase() || "";
      const transactionId = payment.transactionId?.toLowerCase() || "";
      const status = payment.paymentStatus?.toLowerCase() || "";
      const amount = String(payment.amount ?? "").toLowerCase();

      return (
        paymentId.includes(search) ||
        firstName.includes(search) ||
        lastName.includes(search) ||
        email.includes(search) ||
        method.includes(search) ||
        transactionId.includes(search) ||
        status.includes(search) ||
        amount.includes(search)
      );
    });
  }, [payments, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, payments]);

  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  const startIndex = (currentPage - 1) * paymentsPerPage;
  const endIndex = startIndex + paymentsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

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
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center">
          <CreditCard className="mr-3 h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">Payment Details</h1>
        </div>

        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-green-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by payment id, user, email, method, transaction id, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-sm font-semibold shadow-sm outline-none focus:ring-2 focus:ring-green-500/10"
          />
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Sr. No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {currentPayments.map((payment, index) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-700">
                      {startIndex + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {payment._id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {payment.userId
                        ? `${payment.userId.firstname} ${payment.userId.lastname} (${payment.userId.email})`
                        : "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {payment.paymentMethod}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {payment.transactionId}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          payment.paymentStatus === "success"
                            ? "bg-green-100 text-green-800"
                            : payment.paymentStatus === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payments</h3>
              <p className="mt-1 text-sm text-gray-500">
                No payment records found.
              </p>
            </div>
          )}
        </div>

        {filteredPayments.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm md:flex-row">
            <p className="text-sm font-medium text-gray-500">
              Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-gray-700">
                {Math.min(endIndex, filteredPayments.length)}
              </span>{" "}
              of <span className="font-bold text-gray-700">{filteredPayments.length}</span> payments
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
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

export default AdminPayment;