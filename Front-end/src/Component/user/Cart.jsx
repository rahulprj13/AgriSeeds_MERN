// import React, { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { CartContext } from "../context/CartContext";
// import { useNavigate } from "react-router-dom";

// const Cart = () => {
//   const { user } = useContext(AuthContext);
//   const {
//     cart,
//     incrementQuantity,
//     decrementQuantity,
//     removeFromCart,
//     totalPrice,
//   } = useContext(CartContext);
//   const navigate = useNavigate();

//   if (!user) {
//     navigate("/login");
//     return null;
//   }

//   if (cart.length === 0) {
//     return (
//       <div className="min-h-screen p-8 bg-gray-50 text-center">
//         <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
//         <p>Your cart is empty.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-8 bg-gray-50">
//       <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

//       <div className="space-y-6">
//         {cart.map((item) => (
//           <div
//             key={item.cartId}
//             className="bg-white p-4 rounded shadow flex items-center gap-4"
//           >
//             {/* Product Image */}
//             <img
//               src={item.image}
//               alt={item.name}
//               className="w-24 h-24 object-cover rounded"
//             />

//             {/* Name, price, quantity */}
//             <div className="flex-1">
//               <h2 className="text-lg font-semibold">{item.name}</h2>
//               <p className="text-green-600 font-semibold">₹{item.price} each</p>

//               {/* Quantity controls */}
//               <div className="flex items-center mt-2 gap-2">
//                 <button
//                   onClick={() => decrementQuantity(item.cartId)}
//                   className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
//                 >
//                   -
//                 </button>
//                 <span className="px-3">{item.quantity}</span>
//                 <button
//                   onClick={() => incrementQuantity(item.cartId)}
//                   className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
//                 >
//                   +
//                 </button>
//               </div>
//             </div>

//             {/* Total price & remove */}
//             <div className="flex flex-col items-end gap-2">
//               <p className="font-semibold">₹{item.price * item.quantity}</p>
//               <button
//                 onClick={() => removeFromCart(item.cartId)}
//                 className="text-red-500 hover:underline text-sm"
//               >
//                 Remove
//               </button>
//             </div>
//           </div>
//         ))}

//         {/* Cart Total */}
//         <div className="text-right mt-6">
//           <h2 className="text-xl font-bold">
//             Total: <span className="text-green-600">₹{totalPrice}</span>
//           </h2>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;




import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const {
    cart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    totalPrice,
  } = useContext(CartContext);

  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-500">Your cart is empty.</p>

        <button
          onClick={() => navigate(`/category/vegetables`)}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-5">
          {cart.map((item) => (
            <div
              key={item.cartId}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex gap-4"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.name}
                onClick={() => navigate(`/category/${item.type}/${item.id}`)}
                className="w-28 h-28 object-cover rounded-lg cursor-pointer"
              />

              {/* Product Info */}
              <div className="flex-1">
                <h2
                  onClick={() => navigate(`/category/${item.type}/${item.id}`)}
                  className="text-lg font-semibold cursor-pointer hover:text-green-600"
                >
                  {item.name}
                </h2>

                <p className="text-green-600 font-semibold mt-1">
                  ₹{item.price}
                </p>

                {/* Quantity */}
                <div className="flex items-center mt-3 gap-3">
                  <button
                    onClick={() => decrementQuantity(item)}
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                  >
                    -
                  </button>

                  <span className="font-semibold">{item.quantity}</span>

                  <button
                    onClick={() => incrementQuantity(item)}
                    className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 text-sm mt-3 hover:underline"
                >
                  Remove
                </button>
              </div>

              {/* Price */}
              <div className="flex flex-col justify-between items-end">
                <p className="font-bold text-lg">
                  ₹{item.price * item.quantity}
                </p>

                <button
                  onClick={() => navigate(`/checkout/${item.id}`)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="flex justify-between mb-2">
            <span>Total Items</span>
            <span>{cart.length}</span>
          </div>

          <div className="flex justify-between mb-4">
            <span>Total Price</span>
            <span className="font-semibold text-green-600">
              ₹{totalPrice}
            </span>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;