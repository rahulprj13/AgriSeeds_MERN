import axios from "axios"
import React, { useState } from "react";
import img from "../../assets/Images/background.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSeedling } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const SignUp = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    getValues,
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

  // SEND OTP

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

  // REGISTER

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
      className="relative min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >

      {/* Blur Layer */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/40"></div>

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md">

        <div
  className="relative rounded-2xl shadow-2xl border border-white/20
  bg-white/10 backdrop-blur-xl text-white
  p-8"
>

          {/* CLOSE BUTTON */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-4 right-4 text-white text-xl hover:text-red-400"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>

          {/* TITLE */}
          <h2 className="text-center text-3xl font-bold mb-6">

            <FontAwesomeIcon
              icon={faSeedling}
              className="text-green-400 mr-2"
            />

            Create Account

          </h2>

          {/* FORM */}

          <form
            onSubmit={handleSubmit(submitHandler)}
            className="space-y-4"
          >

<div className="grid grid-cols-2 gap-3">

  {/* FIRST NAME */}
  <div>

    <input
      type="text"
      placeholder="First Name"
      {...register("firstname", validationRules.firstname)}
      className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30
      focus:outline-none focus:border-green-400 placeholder-gray-200"
    />

    <p className="text-red-400 text-sm mt-1">
      {errors.firstname?.message}
    </p>

  </div>

  {/* LAST NAME */}
  <div>

    <input
      type="text"
      placeholder="Last Name"
      {...register("lastname", validationRules.lastname)}
      className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30
      focus:outline-none focus:border-green-400 placeholder-gray-200"
    />

    <p className="text-red-400 text-sm mt-1">
      {errors.lastname?.message}
    </p>

  </div>

</div>


            {/* EMAIL */}

            <div>

              <input
                type="email"
                placeholder="Email Address"
                {...register("email", validationRules.email)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30
              focus:outline-none focus:border-green-400 placeholder-gray-200"
              />

              <p className="text-red-400 text-sm mt-1">
                {errors.email?.message}
              </p>

            </div>


            {/* SEND OTP */}

            <button
              type="button"
              onClick={sendOtp}
              className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600
            font-semibold transition"
            >
              Send OTP
            </button>


            {/* OTP */}

            <div>

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

                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30
              focus:outline-none focus:border-green-400 placeholder-gray-200"
              />

              <p className="text-red-400 text-sm mt-1">
                {errors.otp?.message}
              </p>

            </div>


            {/* PASSWORD */}

            <div className="flex">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"

                {...register("password", validationRules.password)}

                className="flex-1 px-4 py-3 rounded-l-xl bg-white/20 border border-white/30
              focus:outline-none focus:border-green-400 placeholder-gray-200"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}

                className="px-4 bg-white text-black rounded-r-xl"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            <p className="text-red-400 text-sm">
              {errors.password?.message}
            </p>


            {/* CONFIRM PASSWORD */}

            <div className="flex">

              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"

                {...register("confirmPassword", validationRules.confirmPassword)}

                className="flex-1 px-4 py-3 rounded-l-xl bg-white/20 border border-white/30
                          focus:outline-none focus:border-green-400 placeholder-gray-200"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="px-4 bg-white text-black rounded-r-xl"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>

            </div>

            <p className="text-red-400 text-sm mt-1">
              {errors.confirmPassword?.message}
            </p>

            {/* REGISTER */}

            <button
              className="w-full py-3 font-bold rounded-xl bg-white text-black
            hover:bg-gray-200 transition"
            >
              Register
            </button>


            <p className="text-center text-sm mt-2">

              Already have an account?{" "}

              <Link
                to="/login"
                className="text-yellow-400 font-semibold"
              >
                Login
              </Link>

            </p>

          </form>

        </div>

      </div>

    </div>

  )

}

export default SignUp