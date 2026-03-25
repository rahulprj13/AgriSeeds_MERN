import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Package,
  AlertCircle,
  Filter,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  currentPrice: "",
  weight: "",
  unit: "",
  imagePath: "",
  categoryId: "",
  stock: "",
  status: "active",
};

const API_URL = "http://localhost:5000";

const AdminProducts = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  const loadData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [catRes, prodRes] = await Promise.all([
        axios.get("/api/categories", { headers }),
        axios.get("/api/admin/products", { headers }),
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      toast.error("Data loading failed");
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const sanitizeHTML = (str) => str.replace(/<[^>]*>?/gm, "");

  const validate = () => {
    let tempErrors = {};
    if (!form.name.trim()) tempErrors.name = "Product name is required";
    if (!form.price) tempErrors.price = "Price is required";
    if (form.price < 0) tempErrors.price = "Price cannot be negative";
    if (!form.currentPrice) tempErrors.currentPrice = "Current price is required";
    if (form.currentPrice && form.currentPrice < 0)
      tempErrors.currentPrice = "Current price cannot be negative";
    if (!form.categoryId) tempErrors.categoryId = "Please select a category";
    if (!form.unit) tempErrors.unit = "Unit is required";
    if (!form.weight) tempErrors.weight = "Weight is required";
    if (!form.stock) tempErrors.stock = "Stock quantity is required";
    if (!form.description.trim()) tempErrors.description = "Description is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const regex = /^[a-zA-Z0-9\s]*$/;
      if (!regex.test(value) || value.length > 30) return;
    }

    if (name === "description" && value.length > 200) return;

    if (
      (name === "price" ||
        name === "stock" ||
        name === "currentPrice" ||
        name === "weight") &&
      value < 0
    )
      return;

    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, imagePath: e.target.files[0] }));
  };

  const resetForm = () => {
    setForm(emptyProduct);
    setErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    const cleanDesc = sanitizeHTML(form.description);

    Object.keys(form).forEach((key) => {
      if (key === "description") {
        formData.append(key, cleanDesc);
      } else if (key === "imagePath") {
        if (form.imagePath instanceof File) {
          formData.append("image", form.imagePath);
        }
      } else {
        formData.append(key, form[key]);
      }
    });

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editingId) {
        await axios.put(`/api/admin/products/${editingId}`, formData, config);
        toast.success("Product Updated");
      } else {
        await axios.post("/api/admin/products", formData, config);
        toast.success("Product Created");
      }

      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);

    const catId = p.categoryId?._id || p.category?._id || p.categoryId || "";

    setForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      currentPrice: p.currentPrice ? p.currentPrice.toString() : "",
      weight: p.weight ? p.weight.toString() : "",
      unit: p.unit || "",
      imagePath: p.imagePath || "",
      categoryId: catId,
      stock: p.stock.toString(),
      status: p.status,
    });

    setErrors({});
    setShowForm(true);
  };

  const executeDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted successfully");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleDelete = (id, productName) => {
    toast.dismiss();

    toast(
      ({ closeToast }) => (
        <div className="p-2">
          <p className="mb-4 text-sm font-bold text-gray-800">
            Delete <span className="text-red-500">{productName}</span> product?
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

  const filteredProducts = products.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    const categoryName = p.categoryId?.name || p.category?.name || "";

    const matchesSearch =
      p.name.toLowerCase().includes(searchLower) ||
      categoryName.toLowerCase().includes(searchLower);

    const productCatId = p.categoryId?._id || p.category?._id || p.categoryId;
    const matchesCat = filterCategory === "" || productCatId === filterCategory;

    return matchesSearch && matchesCat;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, products]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

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
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  const paginationPages = getPaginationPages();

  return (
    <div className="p-1 md:p-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Package className="text-green-600" /> PRODUCTS
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Product Management System
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
            showForm
              ? "bg-slate-100 text-slate-600"
              : "bg-green-600 text-white hover:bg-green-700 shadow-green-200"
          }`}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close Form" : "Add New Product"}
        </button>
      </div>

      {showForm && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 md:p-8 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                  Name <span>{form.name.length}/30</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.name ? "border-red-500" : "border-slate-200"
                  } rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-semibold`}
                  placeholder="Ex: Organic Tomato 101"
                />
                {errors.name && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.categoryId ? "border-red-500" : "border-slate-200"
                  } rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none font-semibold`}
                >
                  <option value="">---Choose Category---</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.categoryId}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Actual Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.price ? "border-red-500" : "border-slate-200"
                  } rounded-xl px-4 py-3 text-sm outline-none font-semibold`}
                />
                {errors.price && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.price}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Current Price/Selling Price (₹)
                </label>
                <input
                  type="number"
                  name="currentPrice"
                  value={form.currentPrice}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.currentPrice ? "border-red-500" : "border-slate-200"
                  } rounded-xl px-4 py-3 text-sm outline-none font-semibold`}
                />
                {errors.currentPrice && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.currentPrice}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Weight (kg/g)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.weight ? "border-red-500" : "border-slate-200"
                  } rounded-xl px-4 py-3 text-sm outline-none font-semibold`}
                />
                {errors.weight && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.weight}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Unit
                </label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.unit ? "border-red-500" : "border-slate-200"
                  } rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500/20 outline-none font-semibold`}
                >
                  <option value="">---Choose Unit---</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="gram">Gram (g)</option>
                </select>
                {errors.unit && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.unit}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  className={`w-full bg-slate-50 border ${
                    errors.stock ? "border-red-500" : "border-slate-200"
                  } rounded-xl px-4 py-3 text-sm outline-none font-semibold`}
                />
                {errors.stock && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {errors.stock}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Visibility
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Image Upload
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 font-bold"
                />
                {form.imagePath && !(form.imagePath instanceof File) && (
                  <div className="mt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Current Image:
                    </p>
                    <img
                      src={`${API_URL}/uploads/${form.imagePath}`}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                      alt="Current product image"
                      onError={(e) =>
                        (e.target.src = "https://placehold.co/100x100?text=No+Img")
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                Description <span>{form.description.length}/200</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className={`w-full bg-slate-50 border ${
                  errors.description ? "border-red-500" : "border-slate-200"
                } rounded-xl px-4 py-3 text-sm outline-none font-medium`}
                placeholder="Enter product details..."
              />
              {errors.description && (
                <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {errors.description}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 text-white px-10 py-3 rounded-xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all"
              >
                {loading ? "Processing..." : editingId ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-green-500/10"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm shrink-0">
            <Filter size={18} className="text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-sm font-black text-slate-600 outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Sr. No.
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Image
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Product Info
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Category
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Actual Price
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Current Price
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Unit
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Weight
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Stock
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {currentProducts.map((p, index) => {
                let imgSrc = "https://placehold.co/100x100?text=No+Img";
                if (p.imagePath) {
                  if (typeof p.imagePath === "string" && p.imagePath.startsWith("http")) {
                    imgSrc = p.imagePath;
                  } else if (
                    typeof p.imagePath === "string" &&
                    p.imagePath.startsWith("/")
                  ) {
                    imgSrc = `${API_URL}${p.imagePath}`;
                  } else if (typeof p.imagePath === "string") {
                    imgSrc = `${API_URL}/uploads/${p.imagePath}`;
                  }
                }

                return (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-6 py-4 text-center font-black text-slate-600">
                      {startIndex + index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <img
                        src={imgSrc}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                        alt=""
                        onError={(e) =>
                          (e.target.src = "https://placehold.co/100x100?text=No+Img")
                        }
                      />
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-800">{p.name}</p>
                      <p
                        className={`text-[9px] font-black uppercase mt-1 ${
                          p.status === "active" ? "text-green-500" : "text-red-400"
                        }`}
                      >
                        {p.status}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                        {p.categoryId?.name || "None"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center font-black text-slate-800">
                      ₹{p.price}
                    </td>

                    <td className="px-6 py-4 text-center font-black text-slate-800">
                      ₹{p.currentPrice}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-slate-600">{p.unit}</span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-slate-600">{p.weight}</span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-sm font-black ${
                          p.stock < 10 ? "text-red-500" : "text-slate-600"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
              No products found
            </div>
          )}
        </div>

        {filteredProducts.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm md:flex-row">
            <p className="text-sm font-medium text-gray-500">
              Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-gray-700">
                {Math.min(endIndex, filteredProducts.length)}
              </span>{" "}
              of <span className="font-bold text-gray-700">{filteredProducts.length}</span> products
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
                    className={`h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition ${
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
  );
};

export default AdminProducts;