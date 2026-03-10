import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Products = () => {
  const { type, item } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/products");
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = products.filter((p) =>
    item ? p.name?.toLowerCase().includes(item.toLowerCase()) : true
  );

  return (
    <div className="max-w-6xl mx-auto my-12 px-4">
      <h1 className="text-green-600 text-3xl font-bold text-center mb-8">
        {item} Seeds
      </h1>

      {loading && (
        <p className="text-center text-gray-600 mb-4">Loading products...</p>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-gray-600 mb-4">No products found.</p>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {filtered.map((p) => (
          <div
            key={p._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-52 object-cover"
            />

            <div className="text-center p-4">
              <h5 className="text-lg font-semibold">{p.name}</h5>

              <h6 className="text-green-600 font-bold mt-2">₹{p.price}</h6>

              <button
                className="mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
                onClick={() =>
                  navigate(`/category/${type}/${item}/${p._id}`, {
                    state: p,
                  })
                }
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;