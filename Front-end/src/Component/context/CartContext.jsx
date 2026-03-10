
// import React, { createContext, useState, useEffect, useContext } from "react";
// import { AuthContext } from "./AuthContext";

// export const CartContext = createContext();

// const CartProvider = ({ children }) => {
//   const { user } = useContext(AuthContext);
//   const [cart, setCart] = useState([]);

//   // Load cart from localStorage when user changes
//   useEffect(() => {
//     if (user) {
//       const storedCart = localStorage.getItem(`cart_${user.id}`);
//       if (storedCart) setCart(JSON.parse(storedCart));
//       else setCart([]);
//     } else {
//       setCart([]);
//     }
//   }, [user]);

//   // Update cart both in state and localStorage
//   const updateCart = (newCart) => {
//     setCart(newCart);
//     if (user) localStorage.setItem(`cart_${user.id}`, JSON.stringify(newCart));
//   };

//   // Add product to cart
// const addToCart = (product) => {
//   setCart((prevCart) => [
//     ...prevCart,
//     { ...product, quantity: 1, cartId: Date.now() }
//   ]);
// };

//   // Remove product from cart
//   const removeFromCart = (cartId) => {
//   setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
// };

//   // Increment/decrement quantity
// const incrementQuantity = (cartId) => {
//   setCart((prevCart) =>
//     prevCart.map((item) =>
//       item.cartId === cartId
//         ? { ...item, quantity: item.quantity < 10 ? item.quantity + 1 : 10 }
//         : item
//     )
//   );
// };

//   const decrementQuantity = (cartId) => {
//   setCart((prevCart) =>
//     prevCart.map((item) =>
//       item.cartId === cartId
//         ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
//         : item
//     )
//   );
// };

//   // Calculate total price
//   const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

//   return (
//     <CartContext.Provider
//       value={{
//         cart,
//         addToCart,
//         removeFromCart,
//         incrementQuantity,
//         decrementQuantity,
//         totalPrice,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export default CartProvider;



import React from "react";
import axios from "axios";
import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchCart = async () => {

    const res = await axios.get(
      `/cart/${user._id}`
    );

    setCart(res.data.data);

  };


  useEffect(() => {

    if (user) {
      fetchCart();
    }

  }, []);



  const addToCart = async (product) => {

    await axios.post("/cart/add", {
      userId: user._id,
      product
    });

    fetchCart();

  };


  const incrementQuantity = async (item) => {

    await axios.put(
      `/cart/${item._id}`,
      { quantity: item.quantity + 1 }
    );

    fetchCart();

  };


  const decrementQuantity = async (item) => {

    if (item.quantity === 1) return;

    await axios.put(
      `/cart/${item._id}`,
      { quantity: item.quantity - 1 }
    );

    fetchCart();

  };


  const removeFromCart = async (id) => {

    await axios.delete(
      `/cart/${id}`
    );

    fetchCart();

  };


  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );


  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};