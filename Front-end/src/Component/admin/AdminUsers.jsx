import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Users } from "lucide-react";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null); // Dropdown track karne ke liye

  const loadUsers = async () => {
    try {
      const { data } = await axios.get("/api/admin/users");
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      if (!toast.isActive("load-error")) {
        toast.error("Failed to load users", { toastId: "load-error" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // --- CUSTOM WARNING COMPONENT ---
  const ConfirmAction = ({ message, onConfirm, closeToast, colorClass }) => (
    <div className="p-2">
      <p className="text-sm font-bold text-gray-800 mb-4">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={closeToast} className="px-3 py-1 text-[10px] font-bold uppercase text-gray-400">Cancel</button>
        <button 
          onClick={() => { onConfirm(); closeToast(); }}
          className={`px-4 py-1.5 rounded-lg text-white text-[10px] font-black uppercase shadow-sm ${colorClass}`}
        >
          Yes, Change it
        </button>
      </div>
    </div>
  );

  // --- TRIGGER ACTIONS ---
  const triggerStatusChange = (user, newStatus) => {
    setOpenDropdown(null); // Dropdown band karein
    toast.dismiss();

    if (user.status === newStatus) return; // Same status pe kuch na karein

    let colorClass = newStatus === 'active' ? "bg-emerald-500" : newStatus === 'inactive' ? "bg-amber-500" : "bg-rose-500";

    toast(({ closeToast }) => (
      <ConfirmAction 
        message={`Change ${user.firstname}'s status to ${newStatus.toUpperCase()}?`} 
        onConfirm={() => executeUpdate(user._id, { status: newStatus }, "status")} 
        closeToast={closeToast}
        colorClass={colorClass}
      />
    ), { position: "top-center", autoClose: false });
  };

  const triggerRoleChange = (user) => {
    toast.dismiss();
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    toast(({ closeToast }) => (
      <ConfirmAction 
        message={`Make ${user.firstname} an ${nextRole.toUpperCase()}?`} 
        onConfirm={() => executeUpdate(user._id, { role: nextRole }, "role")} 
        closeToast={closeToast}
        colorClass="bg-indigo-600"
      />
    ), { position: "top-center", autoClose: false });
  };

  const triggerDelete = (user) => {
    toast.dismiss();
    toast(({ closeToast }) => (
      <ConfirmAction 
        message={`Permanently Delete ${user.firstname}?`} 
        onConfirm={() => executeDelete(user._id)} 
        closeToast={closeToast}
        colorClass="bg-rose-600"
      />
    ), { position: "top-center", autoClose: false });
  };

  // --- API LOGIC ---
  const executeUpdate = async (id, body, endpoint) => {
    try {
      await axios.put(`/api/admin/users/${id}/${endpoint}`, body);
      setUsers(users.map(u => u._id === id ? { ...u, ...body } : u));
      toast.success("Updated successfully!");
    } catch (err) { toast.error("Action failed"); }
  };

  const executeDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      toast.success("Deleted!");
    } catch (err) { toast.error("Delete failed"); }
  };

  return (
    <div className="p-4 md:p-8 bg-[#F8F9FD] min-h-screen font-sans text-gray-800">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="text-green-600" /> USERS
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">User Management System</p>
        </div>
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search email or name..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3.5 top-2.5 opacity-30">🔍</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-8 py-5">Name & Email</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Set Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/30 transition-all">
                  <td className="px-8 py-5 font-bold text-sm">
                    {user.firstname} {user.lastname}
                    <p className="text-gray-400 font-normal text-xs">{user.email}</p>
                  </td>

                  <td className="px-8 py-5">
                    <button onClick={() => triggerRoleChange(user)} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border-2 ${user.role === 'admin' ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-blue-50 border-blue-50 text-blue-500'}`}>
                      {user.role}
                    </button>
                  </td>

                  {/* --- STATUS DROPDOWN LOGIC --- */}
                  <td className="px-8 py-5 relative">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === user._id ? null : user._id)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm border transition-all ${
                        user.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        user.status === 'inactive' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}
                    >
                      {user.status} ▼
                    </button>

                    {openDropdown === user._id && (
                      <div className="absolute z-50 left-8 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in duration-200">
                        {['active', 'inactive', 'blocked'].map((st) => (
                          <button
                            key={st}
                            onClick={() => triggerStatusChange(user, st)}
                            className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase hover:bg-gray-50 text-gray-600 transition-colors"
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="px-8 py-5 text-right">
                    <button onClick={() => triggerDelete(user)} className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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

export default AdminUserManagement;