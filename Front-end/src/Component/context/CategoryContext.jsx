import { createContext } from "react";
import React from "react";

export const CategoryContext = createContext({
    categoryData: {},
    categories: []
});

const CategoryContextProvider = ({ children }) => {

    const categories = [
        { name: "vegetable" },
        { name: "fruits" },
        { name: "flowers" },
        { name: "fertilizers" },
    ];

    // ✅ OBJECT (NOT ARRAY)
    const categoryData = {
        vegetable: {
            title: "Vegetable Seeds",
            desc: "Grow fresh and healthy vegetables in your farm with our premium quality seeds.",
            items: ["Tomato", "Brinjal", "Carrot", "Spinach", "Cabbage", "Chilli"]
        },

        fruits: {
            title: "Fruit Seeds",
            desc: "Start your fruit garden with high germination seeds.",
            items: ["Watermelon", "Papaya", "Musk Melon", "Guava", "Strawberry"]
        },

        flowers: {
            title: "Flower Seeds",
            desc: "Make your garden colorful with beautiful flowers.",
            items: ["Rose", "Marigold", "Sunflower", "Lotus", "Jasmine"]
        },

        fertilizers: {
            title: "Fertilizers",
            desc: "Protect your crops and boost growth with trusted products.",
            items: ["Organic Fertilizer", "Neem Oil", "Insect Killer", "Plant Booster"]
        }
    };

    return (
        <CategoryContext.Provider value={{ categoryData, categories }}>
            {children}
        </CategoryContext.Provider>
    );
};

export default CategoryContextProvider;