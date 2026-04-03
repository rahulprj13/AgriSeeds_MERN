import React from "react";
import { Link, useParams } from "react-router-dom";

const PaymentSuccess = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
        <h1 className="text-3xl font-black text-green-600 mb-4">Payment Successful</h1>
        <p className="text-slate-600 mb-6">Your payment is confirmed. Your order has been created successfully.</p>
        <p className="text-slate-700 font-bold mb-6">Order ID: {orderId}</p>
        <div className="flex flex-col gap-3">
          <Link to="/orders" className="px-6 py-3 rounded-xl text-white bg-slate-900">View Orders</Link>
          <Link to="/" className="px-6 py-3 rounded-xl border border-slate-200">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
