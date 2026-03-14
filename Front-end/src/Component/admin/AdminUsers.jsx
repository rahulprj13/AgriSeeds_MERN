import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Data Fetching Logic
  const loadUsers = async () => {
    try {
      const { data } = await axios.get("/api/admin/users");
      setUsers(data);
    } catch (err) {
      // toastId prevents duplicate messages
      if (!toast.isActive("load-error")) {
        toast.error("Failed to fetch users list", { toastId: "load-error" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 2. Status Toggle Logic (Active/Blocked)
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    
    // Optimistic UI Update: Turant UI change karo bina reload ke
    const previousUsers = [...users];
    setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));

    try {
      await axios.put(`/api/admin/users/${id}/status`, { status: newStatus });
      
      toast.dismiss(); // Purane toast hatao
      if (newStatus === "active") {
        toast.success("User is now Active! ✅");
      } else {
        toast.warn("User has been Blocked! 🚫");
      }
    } catch (err) {
      setUsers(previousUsers); // Error aaye toh purana state wapas lao
      toast.error("Could not update status");
    }
  };

  // 3. Permanent Delete Logic
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This action is permanent!")) {
      try {
        await axios.delete(`/api/admin/users/${id}`);
        setUsers(users.filter((u) => u._id !== id));
        toast.dismiss();
        toast.success("User deleted successfully 🗑️");
      } catch (err) {
        toast.error("Failed to delete user");
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#F8F9FD] min-h-screen font-sans">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Users Directory</h2>
          <p className="text-gray-400 font-medium">Manage user roles and account permissions</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total: </span>
          <span className="text-indigo-600 font-black">{users.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-8 py-5">User Profile</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Status Switch</th>
                <th className="px-8 py-5 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/30 transition-all duration-200">
                  {/* Name & Email */}
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-sm">
                        {user.firstname} {user.lastname}
                      </span>
                      <span className="text-gray-400 text-xs mt-0.5">{user.email}</span>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-50 text-blue-500'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>

                  {/* Status Toggle Switch */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={user.status === 'active'}
                          onChange={() => handleStatusToggle(user._id, user.status)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      <span className={`text-[10px] font-bold uppercase tracking-tight ${
                        user.status === 'active' ? 'text-emerald-500' : 'text-rose-400'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </td>

                  {/* Delete Action */}
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(user._id)} 
                      className="text-gray-300 hover:text-rose-500 transition-all hover:scale-110 p-2"
                      title="Delete Permanently"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <span className="text-4xl mb-4">👥</span>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No users available in the system</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;