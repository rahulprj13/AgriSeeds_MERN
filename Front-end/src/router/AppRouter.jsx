import React, { useContext, lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

// const user = lazy(() => import("../Component/user"));
// const auth = lazy(() => import("../Component/auth"));
// const admin = lazy(() => import("../Component/admin"));


import UserLayout from "../Component/layout/UserLayout";
import AuthLayout from "../Component/layout/AuthLayout";

import Home from "../Component/user/Home";
import About from "../Component/user/About";
import Contact from "../Component/user/Contact";
import Products from "../Component/user/Products";
import ProductDetails from "../Component/user/ProductDetails";
import Search from "../Component/user/Search";
import Cart from "../Component/user/Cart";
import Checkout from "../Component/user/Checkout";
import Orders from "../Component/user/Orders";
import OrderDetails from "../Component/user/OrderDetails";

import Login from "../Component/auth/Login";
import SignUp from "../Component/auth/SignUp";

import AdminLayout from "../Component/admin/AdminLayout";
import AdminDashboard from "../Component/admin/AdminDashboard";
import AdminUsers from "../Component/admin/AdminUsers";
import AdminCategories from "../Component/admin/AdminCategories";
import AdminProducts from "../Component/admin/AdminProducts";
import AdminLogin from "../Component/admin/AdminLogin";

import { AuthContext } from "../Component/context/AuthContext";
import { ForgotPassword } from "../Component/auth/ForgotPassword";
import { ResetPassword } from "../Component/auth/ResetPassword";

const AdminPrivateRoute = ({ children }) => {

  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
};

const router = createBrowserRouter([

  // AUTH PAGES

  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignUp /> },
      {path:"/forgotpassword",element:<ForgotPassword/>},
      {path:"/resetpassword/:token",element:<ResetPassword/>},
    ],
  },

  // USER PAGES

  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "category/:type", element: <Products /> },
      { path: "category/:type/:item", element: <Products /> },
      { path: "category/:type/:item/:id", element: <ProductDetails /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "orders", element: <Orders /> },
      { path: "orders/:id", element: <OrderDetails /> },
      { path: "search", element: <Search /> },
    ],
  },


  // ADMIN LOGIN

  {
    path: "/admin/login",
    element: <AdminLogin />,
  },

  // ADMIN PRIVATE ROUTES

  {
    path: "/admin",
    element: (
      <AdminPrivateRoute>
        <AdminLayout />
      </AdminPrivateRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "users", element: <AdminUsers /> },
      { path: "categories", element: <AdminCategories /> },
      { path: "products", element: <AdminProducts /> },
    ],
  },

]);

const AppRouter = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRouter;