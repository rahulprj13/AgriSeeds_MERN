import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../user/Navbar";
import Footer from "../user/Footer";

const UserLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default UserLayout;