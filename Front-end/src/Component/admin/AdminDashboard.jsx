import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes, cartsRes] = await Promise.all([
          axios.get("/api/admin/stats"),
          axios.get("/api/admin/users"),
          axios.get("/api/admin/carts"),
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
        setCarts(cartsRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading && !stats) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Top stats cards */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs uppercase text-gray-500">Users</p>
          <p className="text-2xl font-bold mt-2">
            {stats?.totalUsers ?? "--"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs uppercase text-gray-500">Products</p>
          <p className="text-2xl font-bold mt-2">
            {stats?.totalProducts ?? "--"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs uppercase text-gray-500">Categories</p>
          <p className="text-2xl font-bold mt-2">
            {stats?.totalCategories ?? "--"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs uppercase text-gray-500">Cart Items</p>
          <p className="text-2xl font-bold mt-2">
            {stats?.totalCartItems ?? "--"}
          </p>
        </div>
      </section>

      {/* Recent users */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Recent Users</h3>
        {users.length === 0 ? (
          <p className="text-sm text-gray-500">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((u) => (
                  <tr key={u._id} className="border-t">
                    <td className="px-3 py-2">
                      {u.firstname} {u.lastname}
                    </td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2 capitalize">{u.role}</td>
                    <td className="px-3 py-2 capitalize">{u.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Cart overview */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Recent Cart Items</h3>
        {carts.length === 0 ? (
          <p className="text-sm text-gray-500">No cart activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {carts.slice(0, 10).map((c) => (
                  <tr key={c._id} className="border-t">
                    <td className="px-3 py-2">
                      {c.userId
                        ? `${c.userId.firstname} ${c.userId.lastname}`
                        : "Guest"}
                    </td>
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2">{c.quantity}</td>
                    <td className="px-3 py-2">₹{c.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;

