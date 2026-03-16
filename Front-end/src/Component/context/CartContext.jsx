import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();
const API_URL = "http://localhost:5000/api/cart";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);

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
    if (!user || !user._id) return; 

    try {
        const res = await axios.get(`${API_URL}/api/cart/${user._id}`);
        setCart(res.data.data);
    } catch (error) {
        console.log("Cart fetch failed - Check if user is logged in");
    }
};

const addToCart = async (product) => {
    if (!user || !user._id) {
        alert("Please login first!");
        navigate("/login");
        return;
    }

    try {
        const res = await axios.post(`${API_URL}/api/cart/add`, {
            userId: user._id, // Ensure this is correctly coming from AuthContext
            product: product
        });
        
        if(res.status === 200 || res.status === 201) {
            fetchCart(); // List refresh karein
        }
    } catch (error) {
        console.error("Add to cart failed:", error.response?.data || error.message);
    }
};

  const incrementQuantity = async (itemId, currentQty) => {
    try {
      await axios.put(`${API_URL}/update/${itemId}`, { quantity: currentQty + 1 });
      fetchCart();
    } catch (error) {
      console.error("Update Error", error);
    }
  };

  const decrementQuantity = async (itemId, currentQty) => {
    if (currentQty <= 1) return;
    try {
      await axios.put(`${API_URL}/update/${itemId}`, { quantity: currentQty - 1 });
      fetchCart();
    } catch (error) {
      console.error("Update Error", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/remove/${itemId}`);
      fetchCart();
    } catch (error) {
      console.error("Remove Error", error);
    }
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
        cart, addToCart, incrementQuantity, decrementQuantity, removeFromCart, totalPrice 
    }}>
      {children}
    </CartContext.Provider>
  );
};