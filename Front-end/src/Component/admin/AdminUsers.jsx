import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/api/admin/users");
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- ACTIONS ---
  const handleStatusUpdate = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    if (window.confirm(`Are you sure you want to ${newStatus} this user?`)) {
      await axios.put(`/api/admin/users/${id}/status`, { status: newStatus });
      fetchUsers(); // Refresh list
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanent delete this user?")) {
      await axios.delete(`/api/admin/users/${id}`);
      fetchUsers();
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Loading...</div>;

  return (
    <div className="bg-[#F8F9FD] min-h-screen p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-800">User Control Center</h2>
          <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-bold">
            Total Users: {users.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800 text-sm">{u.firstname} {u.lastname}</p>
                    <p className="text-gray-400 text-xs">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleStatusUpdate(u._id, u.status)}
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${u.status === 'active' ? 'border-emerald-200 text-emerald-500 bg-emerald-50' : 'border-rose-200 text-rose-500 bg-rose-50'}`}
                    >
                      {u.status === 'active' ? '● Active' : '● Blocked'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleDelete(u._id)}
                      className="text-gray-300 hover:text-rose-500 transition-colors text-sm font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;