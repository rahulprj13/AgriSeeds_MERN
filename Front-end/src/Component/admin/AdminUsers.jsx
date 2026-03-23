import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  Search,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

const emptyForm = {
  firstname: "",
  lastname: "",
  mobile: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "user",
  status: "active",
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

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

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        `${user.firstname} ${user.lastname}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile?.includes(searchTerm)
    );

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

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
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const paginationPages = getPaginationPages();

  const ConfirmAction = ({ message, onConfirm, closeToast, colorClass }) => (
    <div className="p-2">
      <p className="mb-4 text-sm font-bold text-gray-800">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={closeToast}
          className="px-3 py-1 text-[10px] font-bold uppercase text-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            closeToast();
          }}
          className={`rounded-lg px-4 py-1.5 text-[10px] font-black uppercase text-white shadow-sm ${colorClass}`}
        >
          Yes, Change it
        </button>
      </div>
    </div>
  );

  const triggerStatusChange = (user, newStatus) => {
    setOpenDropdown(null);
    toast.dismiss();

    if (user.status === newStatus) return;

    const colorClass =
      newStatus === "active"
        ? "bg-emerald-500"
        : newStatus === "inactive"
        ? "bg-amber-500"
        : "bg-rose-500";

    toast(
      ({ closeToast }) => (
        <ConfirmAction
          message={`Change ${user.firstname}'s status to ${newStatus.toUpperCase()}?`}
          onConfirm={() =>
            executeUpdate(user._id, { status: newStatus }, "status")
          }
          closeToast={closeToast}
          colorClass={colorClass}
        />
      ),
      { position: "top-center", autoClose: false }
    );
  };

  const triggerRoleChange = (user) => {
    toast.dismiss();
    const nextRole = user.role === "admin" ? "user" : "admin";

    toast(
      ({ closeToast }) => (
        <ConfirmAction
          message={`Make ${user.firstname} a ${nextRole.toUpperCase()}?`}
          onConfirm={() => executeUpdate(user._id, { role: nextRole }, "role")}
          closeToast={closeToast}
          colorClass="bg-indigo-600"
        />
      ),
      { position: "top-center", autoClose: false }
    );
  };

  const triggerDelete = (user) => {
    toast.dismiss();
    toast(
      ({ closeToast }) => (
        <ConfirmAction
          message={`Permanently delete ${user.firstname}?`}
          onConfirm={() => executeDelete(user._id)}
          closeToast={closeToast}
          colorClass="bg-rose-600"
        />
      ),
      { position: "top-center", autoClose: false }
    );
  };

  const executeUpdate = async (id, body, endpoint) => {
    try {
      await axios.put(`/api/admin/users/${id}/${endpoint}`, body);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, ...body } : u)));
      toast.success("Updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const executeDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("Deleted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      mobile: user.mobile || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      role: user.role || "user",
      status: user.status || "active",
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let finalValue = value;
    if (name === "mobile") {
      finalValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: finalValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.firstname.trim()) {
      newErrors.firstname = "First name is required";
    } else if (!/^[A-Za-z\s]+$/.test(form.firstname)) {
      newErrors.firstname = "Only letters allowed";
    } else if (form.firstname.trim().length < 3) {
      newErrors.firstname = "Minimum 3 characters";
    }

    if (!form.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    } else if (!/^[A-Za-z\s]+$/.test(form.lastname)) {
      newErrors.lastname = "Only letters allowed";
    } else if (form.lastname.trim().length < 3) {
      newErrors.lastname = "Minimum 3 characters";
    }

    if (!form.mobile.trim()) {
      newErrors.mobile = "Mobile is required";
    } else if (!/^[6-9][0-9]{9}$/.test(form.mobile)) {
      newErrors.mobile = "Enter valid 10-digit mobile";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter valid email";
    }

    if (!editingUser || form.password || form.confirmPassword) {
      if (!form.password) {
        newErrors.password = "Password is required";
      } else if (
        !/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$/.test(
          form.password
        )
      ) {
        newErrors.password =
          "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special";
      }

      if (!form.confirmPassword) {
        newErrors.confirmPassword = "Confirm password is required";
      } else if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      if (editingUser) {
        const payload = {
          firstname: form.firstname,
          lastname: form.lastname,
          mobile: form.mobile,
          email: form.email,
          role: form.role,
          status: form.status,
        };

        if (form.password) {
          payload.password = form.password;
        }

        const { data } = await axios.put(
          `/api/admin/users/${editingUser._id}`,
          payload
        );

        setUsers((prev) =>
          prev.map((u) => (u._id === editingUser._id ? data.user || data : u))
        );

        toast.success("User updated successfully");
      } else {
        const payload = {
          firstname: form.firstname,
          lastname: form.lastname,
          mobile: form.mobile,
          email: form.email,
          password: form.password,
          role: form.role,
          status: form.status,
        };

        const { data } = await axios.post("/api/admin/users", payload);

        setUsers((prev) => [data.user || data, ...prev]);
        toast.success("User added successfully");
      }

      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-4 font-sans text-gray-800 md:p-8">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-800">
            <Users className="text-green-600" /> USERS
          </h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            User Management System
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search email or name..."
              className="w-full rounded-2xl border border-gray-100 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-100"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 opacity-40" />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="overflow-visible rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-50 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-8 py-5">Name & Email</th>
                <th className="px-8 py-5">Mobile</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Set Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-sm text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-sm text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user._id} className="transition-all hover:bg-gray-50/30">
                    <td className="px-8 py-5 text-sm font-bold">
                      {user.firstname} {user.lastname}
                      <p className="text-xs font-normal text-gray-400">{user.email}</p>
                    </td>

                    <td className="px-8 py-5 text-sm font-semibold text-gray-600">
                      {user.mobile || "-"}
                    </td>

                    <td className="px-8 py-5">
                      <button
                        onClick={() => triggerRoleChange(user)}
                        className={`rounded-lg border-2 px-3 py-1 text-[10px] font-black uppercase ${
                          user.role === "admin"
                            ? "border-purple-100 bg-purple-50 text-purple-600"
                            : "border-blue-50 bg-blue-50 text-blue-500"
                        }`}
                      >
                        {user.role}
                      </button>
                    </td>

                    <td className="relative px-8 py-5">
                      <button
                        onClick={() =>
                          setOpenDropdown(openDropdown === user._id ? null : user._id)
                        }
                        className={`rounded-full border px-4 py-1.5 text-[10px] font-black uppercase shadow-sm transition-all ${
                          user.status === "active"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                            : user.status === "inactive"
                            ? "border-amber-100 bg-amber-50 text-amber-600"
                            : "border-rose-100 bg-rose-50 text-rose-600"
                        }`}
                      >
                        {user.status} ▼
                      </button>

                      {openDropdown === user._id && (
                        <div className="absolute left-8 z-50 mt-2 w-32 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                          {["active", "inactive", "blocked"].map((st) => (
                            <button
                              key={st}
                              onClick={() => triggerStatusChange(user, st)}
                              className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase text-gray-600 transition-colors hover:bg-gray-50"
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="rounded-xl bg-indigo-50 p-2.5 text-indigo-500 transition-all hover:bg-indigo-500 hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => triggerDelete(user)}
                          className="rounded-xl bg-rose-50 p-2.5 text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length > 0 && (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm md:flex-row">
          <p className="text-sm font-medium text-gray-500">
            Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to{" "}
            <span className="font-bold text-gray-700">
              {Math.min(endIndex, filteredUsers.length)}
            </span>{" "}
            of <span className="font-bold text-gray-700">{filteredUsers.length}</span> users
          </p>

          <div className="flex items-center gap-2 flex-wrap justify-center">
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
                  className={`h-10 min-w-[40px] rounded-xl px-3 text-sm font-bold transition ${
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  {editingUser ? "Edit User" : "Add User"}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {editingUser ? "Update user details" : "Create new user account"}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-red-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={form.firstname}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                    placeholder="Enter first name"
                  />
                  {errors.firstname && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      {errors.firstname}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                    placeholder="Enter last name"
                  />
                  {errors.lastname && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      {errors.lastname}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Mobile
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                    placeholder="Enter mobile"
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      {errors.mobile}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                    <option value="blocked">blocked</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Password {editingUser && <span className="text-gray-400">(optional)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 pr-11 text-sm outline-none focus:border-green-500"
                      placeholder={
                        editingUser ? "Leave blank to keep same password" : "Enter password"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 pr-11 text-sm outline-none focus:border-green-500"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
                >
                  {saving
                    ? editingUser
                      ? "Updating..."
                      : "Adding..."
                    : editingUser
                    ? "Update User"
                    : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;