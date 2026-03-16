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
