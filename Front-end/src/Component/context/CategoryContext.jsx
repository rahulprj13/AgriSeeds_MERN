import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const CategoryContext = createContext({
  categories: [],
  loading: true
});

const CategoryContextProvider = ({ children }) => {

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {

    try {

      const res = await axios.get("/api/categories");

      setCategories(res.data || []);

    } catch (error) {

      console.log("Category fetch error:", error);

      setCategories([]);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadCategories();

  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        reloadCategories: loadCategories
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryContextProvider;



// import React, { createContext, useEffect, useState } from "react";
// import axios from "axios";

// export const CategoryContext = createContext({
//     categoryData: {},
//     categories: [],
// });

// const CategoryContextProvider = ({ children }) => {

//     const [categories, setCategories] = useState([]);

//     // ✅ OBJECT (NOT ARRAY)
//     const categoryData = {
//         vegetable: {
//             title: "Vegetable Seeds",
//             desc: "Grow fresh and healthy vegetables in your farm with our premium quality seeds.",
//             items: ["Tomato", "Brinjal", "Carrot", "Spinach", "Cabbage", "Chilli"]
//         },

//         fruits: {
//             title: "Fruit Seeds",
//             desc: "Start your fruit garden with high germination seeds.",
//             items: ["Watermelon", "Papaya", "Musk Melon", "Guava", "Strawberry"]
//         },

//         flowers: {
//             title: "Flower Seeds",
//             desc: "Make your garden colorful with beautiful flowers.",
//             items: ["Rose", "Marigold", "Sunflower", "Lotus", "Jasmine"]
//         },

//         fertilizers: {
//             title: "Fertilizers",
//             desc: "Protect your crops and boost growth with trusted products.",
//             items: ["Organic Fertilizer", "Neem Oil", "Insect Killer", "Plant Booster"]
//         }
//     };

//     useEffect(() => {
//         let isMounted = true;

//         const loadCategories = async () => {
//             try {
//                 const res = await axios.get("/api/categories");
//                 if (!isMounted) return;
//                 setCategories(Array.isArray(res.data) ? res.data : []);
//             } catch (err) {
//                 // Keep UI usable even if backend is down
//                 if (!isMounted) return;
//                 setCategories([]);
//             }
//         };

//         loadCategories();

//         return () => {
//             isMounted = false;
//         };
//     }, []);

//     return (
//         <CategoryContext.Provider value={{ categoryData, categories }}>
//             {children}
//         </CategoryContext.Provider>
//     );
// };

// export default CategoryContextProvider;