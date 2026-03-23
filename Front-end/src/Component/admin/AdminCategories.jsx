import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Plus, Search, Pencil, Trash2, X, AlertCircle } from "lucide-react";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 20;

  const loadCategories = async () => {
    try {
      const res = await axios.get("/api/admin/categories");
      setCategories(res.data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z\s]*$/;

    if (regex.test(value) && value.length <= 30) {
      setName(value);
    }
  };

  const resetForm = () => {
    setName("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      toast.error("Name too short (min 2 chars)");
      return;
    }

    setLoading(true);

    try {
      const payload = { name: name.trim() };

      if (editingId) {
        await axios.put(`/api/admin/categories/${editingId}`, payload);
        toast.success("Category updated");
      } else {
        await axios.post("/api/admin/categories", payload);
        toast.success("Category created");
      }

      resetForm();
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setShowForm(true);
  };

  const executeDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      toast.success("Category deleted successfully");
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleDelete = (id, categoryName) => {
    toast.dismiss();

    toast(
      ({ closeToast }) => (
        <div className="p-2">
          <p className="mb-4 text-sm font-bold text-gray-800">
            Delete <span className="text-red-500">{categoryName}</span> category?
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={closeToast}
              className="px-3 py-1 text-[10px] font-bold uppercase text-gray-400"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                executeDelete(id);
                closeToast();
              }}
              className="rounded-lg bg-rose-600 px-4 py-1.5 text-[10px] font-black uppercase text-white shadow-sm"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categories]);

  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
  const startIndex = (currentPage - 1) * categoriesPerPage;
  const endIndex = startIndex + categoriesPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            CATEGORIES
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Manage your product groupings
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
            showForm
              ? "bg-slate-200 text-slate-700"
              : "bg-green-600 text-white hover:bg-green-700 shadow-green-200"
          }`}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close Form" : "Add Category"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {showForm && (
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-green-500" />
              {editingId ? "Edit Category" : "New Category"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                  Category Name ({name.length}/30)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Seeds"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                />
                <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> Only alphabets allowed
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md"
                >
                  {loading
                    ? "Processing..."
                    : editingId
                    ? "Save Changes"
                    : "Create Now"}
                </button>

                {editingId && (
                  <button
                    onClick={resetForm}
                    type="button"
                    className="px-4 py-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className={`${showForm ? "lg:col-span-2" : "lg:col-span-3"} space-y-4`}>
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search category by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                    Sr. No.
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredCategories.length > 0 ? (
                  currentCategories.map((cat, index) => (
                    <tr
                      key={cat._id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-slate-500">
                          {startIndex + index + 1}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-green-600 transition-colors">
                          {cat.name}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(cat._id, cat.name)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Search size={40} className="mb-2" />
                        <p className="text-sm font-bold">
                          No categories found matching your search
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredCategories.length > 0 && (
            <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm md:flex-row">
              <p className="text-sm font-medium text-gray-500">
                Showing{" "}
                <span className="font-bold text-gray-700">{startIndex + 1}</span> to{" "}
                <span className="font-bold text-gray-700">
                  {Math.min(endIndex, filteredCategories.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-700">
                  {filteredCategories.length}
                </span>{" "}
                categories
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
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;