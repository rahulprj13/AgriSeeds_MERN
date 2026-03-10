import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  image: null,
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

  const token = localStorage.getItem("token");

  // Load Categories
  const loadCategories = async () => {
    try {

      const res = await axios.get("/api/admin/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories(res.data);

    } catch (error) {

      console.error(error);
      toast.error("Failed to load categories");

    }
  };

  // Load Products
  const loadProducts = async () => {
    try {

      const res = await axios.get("/api/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  // Input Change
  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  // File Change
  const handleFileChange = (e) => {

    setForm((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));

  };

  const resetForm = () => {

    setForm(emptyProduct);
    setEditingId(null);

  };

  // Submit Form
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.name.trim() || !form.price || !form.categoryId) {
      toast.error("Name, price and category are required");
      return;
    }

    setLoading(true);

    try {

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("categoryId", form.categoryId);
      formData.append("stock", form.stock);
      formData.append("status", form.status);

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editingId) {

        await axios.put(`/api/admin/products/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Product updated");

      } else {

        await axios.post("/api/admin/products", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

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

  // Edit Product
  const handleEdit = (product) => {

    setEditingId(product._id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      image: null,
      categoryId: product.category?._id || "",
      stock: product.stock?.toString() || "",
      status: product.status || "active",
    });

  };

  // Delete Product
  const handleDelete = async (id) => {

    if (!window.confirm("Delete this product?")) return;

    try {

      await axios.delete(`/api/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
            <label className="block text-sm font-medium mb-1">Image</label>

            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border rounded-md px-3 py-2"
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
              rows={3}
              className="w-full border rounded-md px-3 py-2"
            />

          </div>

          <div className="md:col-span-2 flex gap-3">

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md"
            >

              {loading
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Add Product"}

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

          </div>

        </form>

      </section>

      {/* Product List */}

      <section className="bg-white rounded-lg shadow p-6">

        <h3 className="text-xl font-semibold mb-4">Products</h3>

        {products.length === 0 ? (

          <p>No products yet.</p>

        ) : (

          <table className="min-w-full text-sm">

            <thead>

              <tr className="bg-gray-100">

                <th className="px-3 py-2">Image</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>

              </tr>

            </thead>

            <tbody>

              {products.map((p) => (

                <tr key={p._id} className="border-t">

                  <td className="px-3 py-2">

                    <img
                      src={`/uploads/${p.image}`}
                      width="50"
                      alt=""
                    />

                  </td>

                  <td className="px-3 py-2">{p.name}</td>

                  <td className="px-3 py-2">
                    {p.category?.name || "—"}
                  </td>

                  <td className="px-3 py-2">₹{p.price}</td>

                  <td className="px-3 py-2">{p.stock}</td>

                  <td className="px-3 py-2">{p.status}</td>

                  <td className="px-3 py-2 space-x-2">

                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-xs rounded-md transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs rounded-md transition"
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </section>

    </div>
  );
};

export default AdminProducts;