import React, { useState } from "react";
import img from "../assets/Images/background.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSeedling } from "@fortawesome/free-solid-svg-icons";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ✅ React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch("password");

  // ✅ SINGLE Validation Object
  const validationRules = {
    name: {
      required: "Full name is required*",
      pattern: {
        value: /^[A-Za-z\s]+$/,
        message: "Name can contain only letters*",
      },
      minLength: {
        value: 5,
        message: "Name must be at least 5 characters*",
      },
    },

    email: {
      required: "Email is required*",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Enter a valid email*",
      },
    },

    password: {
      required: "Password is required*",
      pattern: {
        value:
          /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$/,
        message:
          "Min 8 chars, 1 uppercase, 1 number, 1 special character*",
      },
    },

    confirmPassword: {
      required: "Confirm your password*",
      validate: (value) =>
        value === passwordValue || "Passwords do not match*",
    },
  };

  const onSubmit = (data) => {
    alert("Registered Successfully...");
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Card */}
      <div
        className="relative p-6 shadow-2xl border w-105 text-white"
        style={{
          borderRadius: "20px",
          backdropFilter: "blur(12px)",
          background: "rgba(82, 80, 80, 0.12)",
          border: "1px solid rgba(113, 109, 109, 0.3)",
        }}
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
            <FontAwesomeIcon icon={faSeedling} className="text-green-400 text-3xl" />
           Create Account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Name */}
          <div className="mb-4">
            <label className="block mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              {...register("name", validationRules.name)}
              className="w-full p-2 rounded bg-transparent border border-gray-300 text-white outline-none"
            />
            <p className="text-black text-1xl mt-1">
              {errors.name?.message}
            </p>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              {...register("email", validationRules.email)}
              className="w-full p-2 rounded bg-transparent border border-gray-300 text-white outline-none"
            />
            <p className="text-black text-1xl mt-1">
              {errors.email?.message}
            </p>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block mb-1">Password</label>

            <div className="flex">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                {...register("password", validationRules.password)}
                className="flex-1 p-2 rounded-l bg-transparent border border-gray-300 text-white outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-4 bg-white text-black font-semibold rounded-r"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <p className="text-black text-1xl mt-1">
              {errors.password?.message}
            </p>
          </div>

          {/* Confirm Password */}
          <div className="mb-4">
            <label className="block mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              {...register(
                "confirmPassword",
                validationRules.confirmPassword
              )}
              className="w-full p-2 rounded bg-transparent border border-gray-300 text-white outline-none"
            />
            <p className="text-black text-1xl mt-1">
              {errors.confirmPassword?.message}
            </p>
          </div>

          {/* Button */}
          <button className="w-full font-bold mt-2 py-2 rounded bg-white text-black hover:bg-gray-200 transition">
            Register
          </button>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link to="/" className="text-yellow-400 font-bold">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;