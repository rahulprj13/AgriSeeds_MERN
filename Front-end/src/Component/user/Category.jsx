import React, { useContext } from "react";
import img from "../../assets/Images/background3.jpg";
import { useNavigate, useParams } from "react-router-dom";
import { CategoryContext } from "../context/CategoryContext";

const Category = () => {

    const { type } = useParams();
    const navigate = useNavigate();

    const { categories } = useContext(CategoryContext);

    // 🔹 Find category from backend data
    const data = categories.find(
        (cat) => cat.name.toLowerCase() === type
    );

    if (!data) {
        return (
            <div className="max-w-7xl mx-auto text-center mt-20 px-4">
                <h2 className="text-3xl font-semibold">
                    Category Not Found 😢
                </h2>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto my-16 px-4">

            {/* Title */}
            <h1 className="text-green-600 font-extrabold text-center mb-12 text-4xl">
                {data.name}
            </h1>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">

                <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden">

                    {/* Image */}
                    <div className="overflow-hidden">
                        <img
                            src={img}
                            alt={data.name}
                            className="w-full h-52 object-cover group-hover:scale-110 transition duration-500"
                        />
                    </div>

                    {/* Content */}
                    <div className="p-6 text-center">

                        <h5 className="font-bold text-xl mb-2">
                            {data.name}
                        </h5>

                        <p className="text-gray-500 mb-6">
                            {data.description || "High quality seeds available"}
                        </p>

                        <button
                            onClick={() => navigate(`/products/${data._id}`)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-300 hover:scale-105"
                        >
                            View Products
                        </button>

                    </div>
                </div>

            </div>

        </div>
    );
};

export default Category;