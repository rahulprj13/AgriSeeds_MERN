import React from 'react'
import AppRouter from './router/AppRouter'
import CategoryContextProvider from './Component/context/CategoryContext'
import { ToastContainer, Zoom } from 'react-toastify';
import axios from 'axios';
import AuthContextProvider from './Component/context/AuthContext';
import {CartProvider} from './Component/context/CartContext';

function App() {

  axios.defaults.baseURL = "http://localhost:5000"

  
  return (
    <>
      <AuthContextProvider>
        <CartProvider>
          <CategoryContextProvider>
            <AppRouter />

            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              transition={Zoom}
            />
          </CategoryContextProvider>
        </CartProvider>
      </AuthContextProvider>
    </>
  )
}

export default App