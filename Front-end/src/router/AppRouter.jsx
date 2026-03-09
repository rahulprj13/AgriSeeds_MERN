import React from "react";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import Login from "../Component/Login";
import SignUp from "../Component/SignUp";
import { Navbar } from "../Component/user/Navbar";
import Home from "../Component/user/Home";
import About from "../Component/user/About";
import Contact from "../Component/user/Contact";
import Category from "../Component/user/Category";
import Products from "../Component/user/Products";
import ProductDetails from "../Component/user/ProductDetails";
import Search from "../Component/user/Search";
import Cart from "../Component/user/Cart";

const router = createBrowserRouter([
    
    // {path:"*", element:<Login/>},
    {path:"/", element:<Navbar/>,
        children:[
            {index:true, element:<Home/>},
            {path:"home", element:<Home/>},
            {path:"about", element:<About/>},
            {path:"contact", element:<Contact/>},
            {path:"category/:type", element:<Category/>},
            {path:"category/:type/:item", element:<Products/>},
            {path:"category/:type/:item/:id", element:<ProductDetails/>},
            {path:"cart", element:<Cart/>},
            {path:"search", element:<Search/>},
            {path:"/login", element:<Login/>},
            {path:"/signup", element:<SignUp/>},


        ],
        
    }
    
])

const AppRouter = () =>{
    return <RouterProvider router = {router}/>
}

export default AppRouter