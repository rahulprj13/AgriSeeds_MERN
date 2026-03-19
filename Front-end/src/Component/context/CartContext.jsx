import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();
const API_URL = "http://localhost:5000";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);
  const userId = user?._id || user?.id || null;
  

  // Fetch Cart from DB when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const fetchCart = async () => {
    // Agar user logged in nahi hai ya id nahi hai, toh request mat bhejo
    if (!userId) return;

    try {
        const res = await axios.get(`${API_URL}/api/cart/${userId}`);
        setCart(res.data.data);
    } catch (error) {
        console.log("Cart fetch failed - Check if user is logged in");
    }
  };

  const addToCart = async (product, category) => {
    // UI should redirect; context just rejects when unauthenticated
    if (!userId) {
      const err = new Error("Please login first");
      err.code = "NOT_AUTHENTICATED";
      throw err;
    }

    try {
        const res = await axios.post(`${API_URL}/api/cart/add`, {
            userId, // backend expects "userId"
            product: product,
              category: category
        });
        
        if(res.status === 200 || res.status === 201) {
            fetchCart(); // List refresh karein
        }
    } catch (error) {
        console.error("Add to cart failed:", error.response?.data || error.message);
        throw error;
    }
  };

  const incrementQuantity = async (itemId, currentQty) => {
    try {
      await axios.put(`${API_URL}/api/cart/update/${itemId}`, { quantity: currentQty + 1 });
      fetchCart();
    } catch (error) {
      console.error("Update Error", error);
    }
  };

  const decrementQuantity = async (itemId, currentQty) => {
    if (currentQty <= 1) return;
    try {
      await axios.put(`${API_URL}/api/cart/update/${itemId}`, { quantity: currentQty - 1 });
      fetchCart();
    } catch (error) {
      console.error("Update Error", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/api/cart/remove/${itemId}`);
      fetchCart();
    } catch (error) {
      console.error("Remove Error", error);
    }
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
        cart, addToCart, incrementQuantity, decrementQuantity, removeFromCart, totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};