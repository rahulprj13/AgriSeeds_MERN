import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CategoryContext } from "../context/CategoryContext";

const Search = () => {

    const { categoryData } = useContext(CategoryContext);
    const location = useLocation();
    const navigate = useNavigate();

    const query = new URLSearchParams(location.search);
    const searchText = query.get("q")?.toLowerCase() || "";

    let results = [];

    Object.keys(categoryData).forEach((cat) => {

        if (cat.toLowerCase().includes(searchText)) {
            results.push({
                type: "category",
                name: cat,
                title: categoryData[cat].title
            });
        }

        categoryData[cat].items.forEach((item) => {
            if (item.toLowerCase().includes(searchText)) {
                results.push({
                    type: "item",
                    name: item,
                    category: cat
                });
            }
        });

    });

    return (

        <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-200 py-16">

            <div className="max-w-7xl mx-auto px-4">

                {/* ✅ Title */}
                <h1 className="text-4xl font-extrabold mb-12">
                    Search Results for{" "}
                    <span className="text-green-600 capitalize">
                        "{searchText}"
                    </span>
                </h1>


                {/* ❌ Empty State */}
                {results.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-24 text-center">

                        <div className="text-7xl mb-6">🔍</div>

                        <h2 className="text-3xl font-bold mb-2">
                            No Results Found
                        </h2>

                        <p className="text-gray-500">
                            Try searching with another keyword.
                        </p>

                    </div>
                )}


                {/* ✅ Results Grid */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">

                    {results.map((res, index) => (

                        <div
                            key={index}
                            onClick={() => {
                                if (res.type === "category") {
                                    navigate(`category/${res.name}`);
                                } else {
                                    navigate(`products/${res.category}/${res.name}`);
                                }
                            }}
                            className="
                                group
                                bg-white
                                rounded-2xl
                                p-6
                                cursor-pointer
                                shadow-md
                                hover:shadow-2xl
                                hover:-translate-y-2
                                transition
                                duration-300
                            "
                        >

                            {/* Badge */}
                            <span className={`
                                inline-block
                                text-xs
                                font-semibold
                                px-3
                                py-1
                                rounded-full
                                mb-4
                                ${res.type === "category"
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-green-100 text-green-600"}
                            `}>
                                {res.type === "category"
                                    ? "Category"
                                    : "Product"}
                            </span>


                            {/* Fake Image Box (Optional but looks premium) */}
                            <div className="
                                h-32
                                rounded-xl
                                mb-4
                                bg-linear-to-br
                                from-green-100
                                to-green-200
                                flex
                                items-center
                                justify-center
                                text-4xl
                                group-hover:scale-105
                                transition
                            ">
                                🌱
                            </div>


                            {/* Name */}
                            <h2 className="text-xl font-bold capitalize mb-2 group-hover:text-green-600 transition">
                                {res.name}
                            </h2>

                            {/* Subtitle */}
                            <p className="text-gray-500 text-sm">
                                {res.type === "category"
                                    ? res.title
                                    : `From ${res.category}`}
                            </p>

                        </div>

                    ))}

                </div>

            </div>
        </div>
    );
};

export default Search;