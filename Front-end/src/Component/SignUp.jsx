import axios from "axios"
import React, { useState } from "react";
import img from "../assets/Images/background.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSeedling } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const SignUp = () => {

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    getValues, // ✅ important
    formState: { errors },
  } = useForm();

  const passwordValue = watch("password");

  const validationRules = {

    firstname: {
      required: "First name is required*",
      pattern: {
        value: /^[A-Za-z\s]+$/,
        message: "Name can contain only letters*"
      },
      minLength: {
        value: 3,
        message: "Name must be at least 3 characters*"
      }
    },

    lastname: {
      required: "Last name is required*",
      pattern: {
        value: /^[A-Za-z\s]+$/,
        message: "Name can contain only letters*"
      },
      minLength: {
        value: 3,
        message: "Name must be at least 3 characters*"
      }
    },

    email: {
      required: "Email is required*",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Enter a valid email*"
      }
    },

    password: {
      required: "Password is required*",
      pattern: {
        value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$/,
        message: "Min 8 chars, 1 uppercase, 1 number, 1 special character*"
      }
    },

    confirmPassword: {
      required: "Confirm your password*",
      validate: (value) =>
        value === passwordValue || "Passwords do not match*"
    }

  }

  // ================= SEND OTP =================

  const sendOtp = async () => {

    const email = getValues("email")

    if (!email) {
      toast.error("Please enter email first")
      return
    }

    try {

      await axios.post("/send-otp", { email })

      toast.success("OTP sent to your email")

    }
    catch (err) {

      toast.error("Failed to send OTP")

    }

  }

  // ================= REGISTER =================

  const submitHandler = async (data) => {

    try {

      const { confirmPassword, ...userData } = data

      const res = await axios.post("/signup", userData)

      if (res.status === 201) {

        toast.success("User registered successfully")

        navigate("/login")

      }

    }
    catch (err) {

      console.log(err)

      if (err.response) {
        toast.error(err.response.data.message)
      } else {
        toast.error("Server error")
      }

    }

  }

  return (

    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >

      <div
        className="relative p-6 shadow-2xl border max-w-md w-full text-white backdrop-blur-lg"
        style={{
          borderRadius: "20px",
          background: "rgba(82,80,80,0.12)",
          border: "1px solid rgba(113,109,109,0.3)"
        }}
      >

        <button
          onClick={() => navigate("/")}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/40"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2 className="text-center font-bold text-3xl mb-6">
          <FontAwesomeIcon icon={faSeedling} className="text-green-400 mr-2" />
          Create Account
        </h2>

        <form onSubmit={handleSubmit(submitHandler)}>

          {/* FIRST NAME */}

          <div className="mb-4">
            <label>First Name</label>
            <input
              type="text"
              placeholder="Enter your first name"
              {...register("firstname", validationRules.firstname)}
              className="w-full p-2 rounded bg-transparent border border-gray-300"
            />
            <p className="text-red-400 text-sm">
              {errors.firstname?.message}
            </p>
          </div>

          {/* LAST NAME */}

          <div className="mb-4">
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Enter your last name"
              {...register("lastname", validationRules.lastname)}
              className="w-full p-2 rounded bg-transparent border border-gray-300"
            />
            <p className="text-red-400 text-sm">
              {errors.lastname?.message}
            </p>
          </div>

          {/* EMAIL */}

          <div className="mb-4">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              {...register("email", validationRules.email)}
              className="w-full p-2 rounded bg-transparent border border-gray-300"
            />
            <p className="text-red-400 text-sm">
              {errors.email?.message}
            </p>
          </div>

          {/* SEND OTP */}

          <button
            type="button"
            onClick={sendOtp}
            className="w-full bg-green-500 py-2 rounded mb-3 hover:bg-green-600"
          >
            Send OTP
          </button>

          {/* OTP */}

          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter OTP"
              maxLength={6}
              {...register("otp", {
                required: "OTP required*",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "OTP must be 6 digits*"
                }
              })}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "")
              }}
              className="w-full p-2 rounded bg-transparent border border-gray-300"
            />
            <p className="text-red-400 text-sm">
              {errors.otp?.message}
            </p>
          </div>

          {/* PASSWORD */}

          <div className="mb-4">

            <label>Password</label>

            <div className="flex">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                {...register("password", validationRules.password)}
                className="flex-1 p-2 rounded-l border border-gray-300"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-4 bg-white text-black rounded-r"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            <p className="text-red-400 text-sm">
              {errors.password?.message}
            </p>

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="mb-4">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              {...register("confirmPassword", validationRules.confirmPassword)}
              className="w-full p-2 rounded border border-gray-300"
            />

            <p className="text-red-400 text-sm">
              {errors.confirmPassword?.message}
            </p>

          </div>

          <button className="w-full font-bold mt-2 py-2 rounded bg-white text-black hover:bg-gray-200">
            Register
          </button>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-yellow-400 font-bold">
              Login
            </Link>
          </p>

        </form>

      </div>

    </div>

  )

}

export default SignUp