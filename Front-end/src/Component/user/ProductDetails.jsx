import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ProductDetails = () => {

    const location = useLocation();
    const navigate = useNavigate();

    // GET DATA
    const product = location.state;

    // Safety check
    if (!product) {
        return (
            <div className="text-center mt-12">
                <h2 className="text-2xl font-semibold">
                    Product Not Found 😢
                </h2>

                <button
                    className="mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (

        <div className="max-w-6xl mx-auto my-12 px-4">

            <button
                className="mb-6 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <div className="grid md:grid-cols-2 gap-10 items-center">

                {/* Image */}
                <div>
                    <img
                        src={product.image}
                        className="w-full rounded-lg shadow-lg"
                        alt={product.name}
                    />
                </div>

                {/* Details */}
                <div>
                    <h2 className="text-3xl font-bold">
                        {product.name}
                    </h2>

                    <h3 className="text-green-600 text-2xl font-semibold mt-3">
                        ₹{product.price}
                    </h3>

                    <p className="mt-4 text-gray-700">
                        Premium quality seeds with high germination rate.
                        Perfect for farmers and home gardeners.
                    </p>

                    <div className="mt-6 flex gap-4">
                        <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
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