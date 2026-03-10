import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await axios.get("/api/admin/categories");
      setCategories(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("active");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      const payload = { name, description, status };

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
      console.error(error);
      const message =
        error.response?.data?.message || "Failed to save category";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name || "");
    setDescription(cat.description || "");
    setStatus(cat.status || "active");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c._id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Category" : "Add Category"}
        </h3>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="e.g. vegetable"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              rows={3}
              placeholder="Short description for this category"
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
            >
              {loading
                ? editingId
                  ? "Updating..."
                  : "Creating..."
                : editingId
                ? "Update Category"
                : "Add Category"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-gray-300 px-4 py-2 rounded-md text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* List */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Categories</h3>

        {categories.length === 0 ? (
          <p className="text-gray-500 text-sm">No categories yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id} className="border-t">
                    <td className="px-3 py-2 font-medium">{cat.name}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          cat.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {cat.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      <span className="line-clamp-2">{cat.description}</span>
                    </td>
                    <td className="px-3 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="px-3 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
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

export default AdminCategories;

