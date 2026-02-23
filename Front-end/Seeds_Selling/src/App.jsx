import React from 'react'
import { useState } from 'react'
import AppRouter from './router/AppRouter'
import CategoryContextProvider from './Component/context/CategoryContext'
import { ToastContainer, toast, Zoom } from 'react-toastify';

function App() {

  return (
    <>
      <CategoryContextProvider>
        <AppRouter />
       <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Zoom}
      />
      
      </CategoryContextProvider>
    </>
  )
}

export default App
