import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  image: "",
  categoryId: "",
  stock: "",
  status: "active",
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProduct);
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

  const loadProducts = async () => {
    try {
      const res = await axios.get("/api/admin/products");
      setProducts(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.categoryId) {
      toast.error("Name, price and category are required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        image: form.image,
        categoryId: form.categoryId,
        stock: form.stock ? Number(form.stock) : 0,
        status: form.status,
      };

      if (editingId) {
        await axios.put(`/api/admin/products/${editingId}`, payload);
        toast.success("Product updated");
      } else {
        await axios.post("/api/admin/products", payload);
        toast.success("Product created");
      }

      resetForm();
      loadProducts();
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message || "Failed to save product";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      image: product.image || "",
      categoryId: product.category?._id || product.category || "",
      stock: product.stock?.toString() || "",
      status: product.status || "active",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/api/admin/products/${id}`);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      <section className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Product" : "Add Product"}
        </h3>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              placeholder="https://..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              rows={3}
              placeholder="Short description"
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
                ? "Update Product"
                : "Add Product"}
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
        <h3 className="text-xl font-semibold mb-4">Products</h3>

        {products.length === 0 ? (
          <p className="text-gray-500 text-sm">No products yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2">
                      {p.category?.name || "—"}
                    </td>
                    <td className="px-3 py-2">₹{p.price}</td>
                    <td className="px-3 py-2">{p.stock}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          p.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="px-3 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
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

export default AdminProducts;

