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
  const [showForm, setShowForm] = useState(false); // Form toggle state

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

  // Validation: Only characters and spaces allowed
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
    setShowForm(true); // Edit karte waqt form auto-open hoga
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      toast.success("Deleted");
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // Search Logic
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">CATEGORIES</h2>
          <p className="text-slate-500 text-sm font-medium">Manage your product groupings</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
            showForm ? "bg-slate-200 text-slate-700" : "bg-green-600 text-white hover:bg-green-700 shadow-green-200"
          }`}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close Form" : "Add Category"}
        </button>
      </div>

      {/* SEARCH BAR & FORM TOGGLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ADD/EDIT FORM - Conditional Rendering */}
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
                  {loading ? "Processing..." : editingId ? "Save Changes" : "Create Now"}
                </button>
                {editingId && (
                  <button onClick={resetForm} type="button" className="px-4 py-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
                    <X size={20} />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* TABLE SECTION */}
        <div className={`${showForm ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={20} />
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
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-green-600 transition-colors">{cat.name}</span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Search size={40} className="mb-2" />
                        <p className="text-sm font-bold">No categories found matching your search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;