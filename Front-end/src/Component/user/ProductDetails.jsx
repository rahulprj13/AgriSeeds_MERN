// import React, { useContext } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// const ProductDetails = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);

//   // GET DATA
//   const product = location.state;

//   // Safety check
//   if (!product) {
//     return (
//       <div className="text-center mt-12">
//         <h2 className="text-2xl font-semibold">Product Not Found 😢</h2>

//         <button
//           className="mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
//           onClick={() => navigate(-1)}
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   // Handle Add to Cart
//   const handleAddToCart = () => {
//     if (!user) {
//       // Redirect to login page if not logged in
//       navigate("/login");
//       return;
//     }

//     // Here you would normally add the product to a cart context or backend
//     // For demo, we navigate to /cart with state
//     navigate("/cart", { state: { product } });
//   };

//   return (
//     <div className="max-w-6xl mx-auto my-12 px-4">
//       <button
//         className="mb-6 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
//         onClick={() => navigate(-1)}
//       >
//         ← Back
//       </button>

//       <div className="grid md:grid-cols-2 gap-10 items-center">
//         {/* Image */}
//         <div>
//           <img
//             src={product.image}
//             className="w-full rounded-lg shadow-lg"
//             alt={product.name}
//           />
//         </div>

//         {/* Details */}
//         <div>
//           <h2 className="text-3xl font-bold">{product.name}</h2>

//           <h3 className="text-green-600 text-2xl font-semibold mt-3">
//             ₹{product.price}
//           </h3>

//           <p className="mt-4 text-gray-700">
//             Premium quality seeds with high germination rate. Perfect for
//             farmers and home gardeners.
//           </p>

//           <div className="mt-6 flex gap-4">
//             <button
//               onClick={handleAddToCart}
//               className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
//             >
//               Add To Cart
//             </button>

//             <button className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition">
//               Buy Now
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetails;


import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(location.state || null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data.product);
        setDetail(res.data.detail);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    // If we already have full product in state, still fetch to get detail
    load();
  }, [id]);

  if (!product && loading) {
    return (
      <div className="text-center mt-12">
        <h2 className="text-2xl font-semibold">Loading product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center mt-12">
        <h2 className="text-2xl font-semibold">Product Not Found 😢</h2>
        <button
          className="mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    addToCart(product);
    navigate("/cart");
  };

  return (
    <div className="max-w-6xl mx-auto my-12 px-4">
      <button
        className="mb-6 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <img
            src={product.image}
            className="w-full rounded-lg shadow-lg"
            alt={product.name}
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold">{product.name}</h2>

          <h3 className="text-green-600 text-2xl font-semibold mt-3">
            ₹{product.price}
          </h3>

          {detail?.brand && (
            <p className="mt-2 text-gray-700">
              <span className="font-semibold">Brand:</span> {detail.brand}
            </p>
          )}

          <p className="mt-4 text-gray-700">
            {detail?.description ||
              "Premium quality seeds with high germination rate. Perfect for farmers and home gardeners."}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
            {detail?.weight && (
              <p>
                <span className="font-semibold">Weight:</span> {detail.weight}
              </p>
            )}
            {detail?.germinationRate && (
              <p>
                <span className="font-semibold">Germination:</span>{" "}
                {detail.germinationRate}
              </p>
            )}
            {detail?.suitableSeason && (
              <p>
                <span className="font-semibold">Season:</span>{" "}
                {detail.suitableSeason}
              </p>
            )}
            {detail?.plantingDepth && (
              <p>
                <span className="font-semibold">Depth:</span>{" "}
                {detail.plantingDepth}
              </p>
            )}
            {detail?.spacing && (
              <p>
                <span className="font-semibold">Spacing:</span>{" "}
                {detail.spacing}
              </p>
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleAddToCart}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              Add To Cart
            </button>

            <button className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;