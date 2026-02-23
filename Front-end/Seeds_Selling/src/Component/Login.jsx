import React, { useState } from "react";
import img from "../assets/Images/background.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSeedling } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";


const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();



  const validationRules = {
    email: {
      required: "Email is required*",
      pattern: {
        value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
        message: "Enter a valid email address*",
      },
    },
    password: {
      required: "Password is required*",
      message: "Password must be at least 8 characters, include an uppercase letter, a number, and a special character*",
      // pattern: {
      //   value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$/,
      //   message:
      //     "Min 8 chars, 1 uppercase, 1 number, 1 special character*",
      // },
    },
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async(data) => {
    try{
      const res = await axios.post("https://node5.onrender.com/user/login",data)
      console.log("response...", res);
      console.log("response data...", res.data);

      if (res.status == 200) {
        toast.success("Login successfully")
        navigate("/user");
      }
      
    }catch{
      console.log(errors);
      toast.error("Login failed. Please check your credentials.")
      
    }
    // alert("Login Successfully 🚀");
    // navigate("/user");
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${img})` }}
    >
      <div
        className="
          relative p-8 shadow-2xl text-white
          w-105
          rounded-[20px]
          backdrop-blur-[19px]
          bg-[rgba(82,80,80,0.1)]
          border border-[rgba(113,109,109,0.3)]
        "
      >
        {/* Close Button */}
        <button
          onClick={() => navigate("/")}
          className="
            absolute top-3 right-3
            flex items-center justify-center
            w-10 h-10
            rounded-full
            bg-white/20 backdrop-blur-md
            text-white text-lg
            shadow-md
            hover:bg-white/40
            hover:scale-110
            transition-all duration-200
          "
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2 className="text-center font-bold text-3xl mb-6">
          <FontAwesomeIcon
            icon={faSeedling}
            className="text-green-400 text-3xl mr-2"
          />
          SeedStore Login
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="mb-4">
            <label className="font-semibold block mb-1">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              {...register("email", validationRules.email)}
              className={`w-full px-3 py-2 rounded-md bg-transparent border text-white placeholder-gray-200 focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-white"
              }`}
            />

            {errors.email && (
              <p className="text-red-400 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="font-semibold block mb-1">
              Password
            </label>

            <div className="flex">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password", validationRules.password)}
                className={`w-full px-3 py-2 rounded-l-md bg-transparent border text-white placeholder-gray-200 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-white"
                }`}
              />

              <button
                type="button"
                onClick={togglePassword}
                className="px-4 rounded-r-md bg-white text-black font-semibold hover:bg-gray-200 transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center mb-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-white" />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="text-yellow-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button className="w-full bg-white text-black font-bold py-2 rounded-md mt-2 hover:bg-gray-200 transition">
            Login
          </button>

          {/* Register */}
          <p className="text-center mt-4 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-yellow-400 font-bold hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;