import React from "react";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import Login from "../Component/Login";
import SignUp from "../Component/SignUp";
import { Navbar } from "../Component/user/Navbar";
import Home from "../Component/user/Home";
import About from "../Component/user/About";
import Contact from "../Component/user/Contact";
import Footer from "../Component/user/Footer";
import Category from "../Component/user/Category";
import Products from "../Component/user/Products";
import ProductDetails from "../Component/user/ProductDetails";
import Getapi from "../Component/user/Getapi";

const router = createBrowserRouter([
    {path:"/", element:<Login/>},
    {path:"/signup", element:<SignUp/>},

    // {path:"*", element:<Login/>},
    {path:"/user", element:<Navbar/>,
        children:[
            {index:true, element:<Home/>},
            {path:"home", element:<Home/>},
            {path:"about", element:<About/>},
            {path:"getapi", element:<Getapi/>},
            {path:"contact", element:<Contact/>},
            {path:"category/:type", element:<Category/>},
            {path:"category/:type/:item", element:<Products/>},
            {path:"category/:type/:item/:id", element:<ProductDetails/>}

        ],
        
    }
    
])

const AppRouter = () =>{
    return <RouterProvider router = {router}/>
}

export default AppRouter