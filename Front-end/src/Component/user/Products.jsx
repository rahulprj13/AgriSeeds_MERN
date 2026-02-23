import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const Products = () => {

    const { type, item } = useParams();
    const navigate = useNavigate();

    // Dummy products
    const products = [
        {
            id: 1,
            name: `${item} Premium Seeds`,
            price: 120,
            image: "https://source.unsplash.com/300x200/?seeds"
        },
        {
            id: 2,
            name: `Organic ${item} Seeds`,
            price: 150,
            image: "https://source.unsplash.com/300x200/?plant"
        }
    ];

    return (
        <div className="max-w-6xl mx-auto my-12 px-4">

            <h1 className="text-green-600 text-3xl font-bold text-center mb-8">
                {item} Seeds
            </h1>

            <div className="grid md:grid-cols-3 gap-8">

                {products.map((p) => (
                    <div 
                        key={p.id}
                        className="bg-white rounded-lg shadow-lg overflow-hidden"
                    >

                        <img 
                            src={p.image} 
                            alt={p.name}
                            className="w-full h-52 object-cover"
                        />

                        <div className="text-center p-4">
                            <h5 className="text-lg font-semibold">
                                {p.name}
                            </h5>

                            <h6 className="text-green-600 font-bold mt-2">
                                ₹{p.price}
                            </h6>

                            <button
                                className="mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
                                onClick={() =>
                                    navigate(`/user/category/${type}/${item}/${p.id}`, {
                                        state: p
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