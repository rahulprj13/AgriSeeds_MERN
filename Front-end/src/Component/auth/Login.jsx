import React, { useContext, useState } from "react";
import img from "../../assets/Images/background.jpg";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSeedling } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const Login = () => {

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    },
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    try {

      setLoading(true);

      const res = await login(data);

      toast.success("Login successfully");

      // ADMIN LOGIN
      if (res?.user?.role === "admin") {

        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        navigate("/admin");

      }
      // USER LOGIN
      else {

        sessionStorage.setItem("token", res.token);
        sessionStorage.setItem("user", JSON.stringify(res.user));

        navigate("/");
      }

    } catch (error) {

      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 text-white">

          {/* Close Button */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 right-4 text-white hover:text-red-400 text-xl"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>

          {/* Logo + Title */}
          <h2 className="text-center text-3xl font-bold mb-6">

            <FontAwesomeIcon
              icon={faSeedling}
              className="text-green-400 mr-2"
            />

            Login

          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* EMAIL */}

            <div>
              <label className="block text-sm mb-1">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                {...register("email", validationRules.email)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30
              focus:outline-none focus:border-green-400 placeholder-gray-200"
              />

              {errors.email && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>


            {/* PASSWORD */}

            <div>

              <label className="block text-sm mb-1">
                Password
              </label>

              <div className="flex">

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password", validationRules.password)}
                  className="flex-1 px-4 py-3 rounded-l-xl bg-white/20 border border-white/30
                focus:outline-none focus:border-green-400 placeholder-gray-200"
                />

                <button
                  type="button"
                  onClick={togglePassword}
                  className="px-4 bg-white text-black rounded-r-xl font-semibold"
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


            {/* REMEMBER + FORGOT */}

            <div className="flex justify-between text-sm">

              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-green-500" />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-yellow-400 hover:underline"
              >
                Forgot Password?
              </Link>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600
            font-bold transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>


            {/* SIGNUP */}

            <p className="text-center text-sm">

              Don't have an account?{" "}

              <Link
                to="/signup"
                className="text-yellow-400 font-semibold"
              >
                Register
              </Link>

            </p>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Login;