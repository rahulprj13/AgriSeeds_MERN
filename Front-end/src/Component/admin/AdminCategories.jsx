
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminCategories = () => {

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // LOAD CATEGORIES
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

  // RESET FORM
  const resetForm = () => {
    setName("");
    setEditingId(null);
  };

  // SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);

    try {

      const payload = { name };

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

      const message =
        error.response?.data?.message || "Failed to save category";

      toast.error(message);

    } finally {

      setLoading(false);

    }
  };

  // EDIT CATEGORY
  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
  };

  // DELETE CATEGORY
  const handleDelete = async (id) => {

    if (!window.confirm("Delete this category?")) return;

    try {

      await axios.delete(`/api/admin/categories/${id}`);

      toast.success("Category deleted");

      setCategories((prev) =>
        prev.filter((cat) => cat._id !== id)
      );

      if (editingId === id) {
        resetForm();
      }

    } catch (error) {

      toast.error("Failed to delete category");

    }

  };

  return (
    <div className="space-y-8">

      {/* ADD CATEGORY FORM */}

      <section className="bg-white rounded-lg shadow p-6">

        <h3 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Category" : "Add Category"}
        </h3>

        <form
          onSubmit={handleSubmit}
          className="flex gap-3"
        >

          <input
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border rounded-md px-3 py-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            {loading
              ? editingId
                ? "Updating..."
                : "Creating..."
              : editingId
              ? "Update"
              : "Add"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="border px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          )}

        </form>

      </section>

      {/* CATEGORY TABLE */}

      <section className="bg-white rounded-lg shadow p-6">

        <h3 className="text-xl font-semibold mb-4">
          Categories
        </h3>

        {categories.length === 0 ? (

          <p className="text-gray-500">
            No categories found.
          </p>

        ) : (

          <div className="overflow-x-auto bg-white rounded-xl shadow-md">

  <table className="w-full text-sm">

    {/* Table Head */}
    <thead className="bg-gray-50 border-b">
      <tr>
        <th className="px-6 py-3 text-left text-gray-600 font-semibold">
          Category Name
        </th>

        <th className="px-6 py-3 text-right text-gray-600 font-semibold">
          Actions
        </th>
      </tr>
    </thead>

    {/* Table Body */}
    <tbody>

      {categories.map((cat) => (

        <tr
          key={cat._id}
          className="border-b hover:bg-gray-50 transition"
        >

          {/* Category Name */}
          <td className="px-6 py-3 font-medium text-gray-800">
            {cat.name}
          </td>

          {/* Actions */}
          <td className="px-6 py-3 text-right space-x-2">

            <button
              onClick={() => handleEdit(cat)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-xs rounded-md transition"
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(cat._id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-xs rounded-md transition"
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

