import React, { useContext, useState, useEffect } from "react";
import img from "../../assets/Images/background.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSeedling } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const AdminLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Load remembered credentials on mount (Implemented by AI Agent)
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("adminRememberedEmail");
    const rememberedPassword = localStorage.getItem("adminRememberedPassword");

    if (rememberedEmail && rememberedPassword) {
      setValue("email", rememberedEmail);
      setValue("password", rememberedPassword);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  const validationRules = {
    email: {
      required: "Email is required*",
    },
    password: {
      required: "Password is required*",
    },
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const res = await login(data);

      // Only allow users with admin role here
      if (res?.user?.role !== "admin") {
        toast.error("Only admin users can log in here.");
        return;
      }

      // Remember Me functionality - Accepted (Implemented by AI Agent)
      if (data.rememberMe) {
        localStorage.setItem("adminRememberedEmail", data.email);
        localStorage.setItem("adminRememberedPassword", data.password);
      } else {
        localStorage.removeItem("adminRememberedEmail");
        localStorage.removeItem("adminRememberedPassword");
      }

      toast.success("Admin login successful");
      navigate("/admin");
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
      className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${img})` }}
    >
      <div
        className="
          relative p-8 shadow-2xl text-white
          w-105
          rounded-[20px]
          backdrop-blur-[19px]
          bg-[rgba(0,0,0,0.6)]
          border border-[rgba(255,255,255,0.2)]
        "
      >
        <h2 className="text-center font-bold text-3xl mb-6">
          <FontAwesomeIcon
            icon={faSeedling}
            className="text-green-400 text-3xl mr-2"
          />
          Admin Panel Login
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label className="font-semibold block mb-1">Admin Email</label>
            <input
              type="email"
              placeholder="admin@gmail.com"
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

          <div className="mb-4">
            <label className="font-semibold block mb-1">Password</label>
            <div className="flex">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                {...register("password", validationRules.password)}
                className={`w-full px-3 py-2 rounded-l-md bg-transparent border text-white placeholder-gray-200 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              {...register("rememberMe")}
              className="accent-green-500 w-4 h-4 mr-2 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-sm cursor-pointer">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-2 rounded-md mt-2 hover:bg-green-700 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

