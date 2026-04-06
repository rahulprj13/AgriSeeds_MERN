import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import img from "../../assets/Images/seedsbackground.avif";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faSeedling,
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faMobileAlt,
  faUser,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
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
    setValue,
    formState: { errors },
  } = useForm();

  const passwordValue = watch("password");

  const validationRules = {
    firstname: {
      required: "First name is required*",
      pattern: {
        value: /^[A-Za-z\s]+$/,
        message: "Name can contain only letters*",
      },
      minLength: {
        value: 3,
        message: "Name must be at least 3 characters*",
      },
    },

    lastname: {
      required: "Last name is required*",
      pattern: {
        value: /^[A-Za-z\s]+$/,
        message: "Name can contain only letters*",
      },
      minLength: {
        value: 3,
        message: "Name must be at least 3 characters*",
      },
    },

    mobile: {
      required: "Mobile number is required*",
      pattern: {
        value: /^[6-9][0-9]{9}$/,
        message: "Enter a valid 10-digit mobile number*",
      },
      minLength: {
        value: 10,
        message: "Mobile number must be 10 digits*",
      },
      maxLength: {
        value: 10,
        message: "Mobile number cannot exceed 10 digits*",
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
        value: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$/,
        message: "Min 8 chars, 1 uppercase, 1 number, 1 special character*",
      },
    },

    confirmPassword: {
      required: "Confirm your password*",
      validate: (value) =>
        value === passwordValue || "Passwords do not match*",
    },
  };

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [otpDigits, setOtpDigits] = useState(new Array(6).fill(""));
  const otpRefs = useRef([]);

  const handleOtpChange = (index, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const copy = [...otpDigits];
    copy[index] = val;
    setOtpDigits(copy);
    setValue("otp", copy.join(""));
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const sendOtp = async () => {
    const email = getValues("email");
    if (!email) {
      toast.error("Please enter email first");
      return;
    }

    try {
      setSendingOtp(true);
      await axios.post("/send-otp", { email });
      setOtpSent(true);
      setSecondsLeft(60);
      toast.success("OTP sent to your email");
      setValue("otp", "");
      setOtpDigits(new Array(6).fill(""));
    } catch (err) {
      console.log(err);
      toast.error("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const submitHandler = async (data) => {
    try {
      const { confirmPassword, ...userData } = data;
      const res = await axios.post("/signup", userData);
      if (res.status === 201) {
        toast.success("User registered successfully");
        navigate("/login");
        return;
      }
      toast.error("Registration failed");
    } catch (err) {
      console.log(err);
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Server error");
      }
    }
  };

  useEffect(() => {
    let timer;

    if (secondsLeft > 0) {
      timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    } else if (secondsLeft === 0 && otpSent) {
      setOtpDigits(new Array(6).fill(""));
      setValue("otp", "");
      setOtpSent(false);
      toast.error("OTP expired. Please request a new OTP.");
    }

    return () => clearTimeout(timer);
  }, [secondsLeft, otpSent, setValue]);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-3 py-4"
      style={{
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-emerald-950/70 to-black/85"></div> */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-emerald-950/45 to-black/60"></div>
      {/* <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div> */}

      <div className="absolute top-0 left-0 h-56 w-56 rounded-full bg-green-400/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-lime-300/10 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] lg:grid-cols-[1fr_1.2fr]"> */}
        <div className="grid overflow-hidden rounded-3xl border border-white/15 bg-white/6 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] lg:grid-cols-[1fr_1.2fr]">

          {/* Left Panel */}
          {/* <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-green-500/20 to-emerald-800/20 p-8 text-white border-r border-white/10"> */}
          <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-green-500/12 to-emerald-800/12 p-8 text-white border-r border-white/10">

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
              <FontAwesomeIcon icon={faSeedling} className="text-2xl text-white" />
            </div>

            <h2 className="text-3xl font-extrabold leading-tight">
              Create your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-200">
              Register securely and verify your email with OTP to continue.
              Fast, clean and easy signup experience.
            </p>

            <div className="mt-6 space-y-3 text-sm text-gray-100">
              <div className="rounded-xl bg-white/10 px-4 py-3">
                Secure email verification
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-3">
                Strong password protection
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-3">
                Quick and responsive signup flow
              </div>
            </div>
          </div>

          {/* Right Panel */}
          {/* <div className="relative p-4 sm:p-5 md:p-6 text-white"> */}
          <div className="relative bg-white/4 p-4 sm:p-5 md:p-6 text-white">
            <button
              onClick={() => navigate("/")}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-red-500"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <div className="mb-4 pr-10 lg:hidden">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
                <FontAwesomeIcon icon={faSeedling} className="text-lg text-white" />
              </div>
              <h2 className="text-2xl font-bold">Create Account</h2>
              <p className="mt-1 text-sm text-gray-200">
                Fill in your details to register
              </p>
            </div>

            <div className="mb-4 hidden lg:block">
              <h3 className="text-2xl font-bold">Sign Up</h3>
              <p className="mt-1 text-sm text-gray-200">
                Complete your details below
              </p>
            </div>

            <form onSubmit={handleSubmit(submitHandler)} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold tracking-wide text-gray-100">
                    First Name
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300"
                    />
                    <input
                      type="text"
                      placeholder="First name"
                      {...register("firstname", validationRules.firstname)}
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white outline-none transition focus:border-green-400 focus:bg-white/15"
                    />
                  </div>
                  <p className="mt-1 min-h-[16px] text-[11px] font-medium text-red-300">
                    {errors.firstname?.message}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold tracking-wide text-gray-100">
                    Last Name
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      {...register("lastname", validationRules.lastname)}
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white outline-none transition focus:border-green-400 focus:bg-white/15"
                    />
                  </div>
                  <p className="mt-1 min-h-[16px] text-[11px] font-medium text-red-300">
                    {errors.lastname?.message}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold tracking-wide text-gray-100">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faMobileAlt}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300"
                    />
                    <input
                      type="text"
                      placeholder="Mobile number"
                      {...register("mobile", validationRules.mobile)}
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      }}
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white outline-none transition focus:border-green-400 focus:bg-white/15"
                    />
                  </div>
                  <p className="mt-1 min-h-[16px] text-[11px] font-medium text-red-300">
                    {errors.mobile?.message}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold tracking-wide text-gray-100">
                    Email Address
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      {...register("email", validationRules.email)}
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white outline-none transition focus:border-green-400 focus:bg-white/15"
                    />
                  </div>
                  <p className="mt-1 min-h-[16px] text-[11px] font-medium text-red-300">
                    {errors.email?.message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={sendOtp}
                disabled={sendingOtp || secondsLeft > 0}
                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-green-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingOtp
                  ? "Sending..."
                  : secondsLeft > 0
                    ? `Resend OTP (${secondsLeft}s)`
                    : "Send OTP"}
              </button>

              <div>
                <input
                  type="hidden"
                  {...register("otp", {
                    required: "OTP required*",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "OTP must be 6 digits*",
                    },
                  })}
                />

                {otpSent && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold text-gray-200">
                      <FontAwesomeIcon icon={faShieldHalved} className="text-green-300" />
                      Enter 6-digit OTP
                    </div>

                    <div className="flex justify-center gap-2">
                      {otpDigits.map((d, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          value={otpDigits[i]}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          maxLength={1}
                          inputMode="numeric"
                          className="h-10 w-10 rounded-lg border border-white/20 bg-white/10 text-center text-base font-bold text-white outline-none transition focus:border-green-400 focus:bg-white/15 sm:h-11 sm:w-11"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-1 min-h-[16px] text-[11px] font-medium text-red-300">
                  {errors.otp?.message}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold tracking-wide text-gray-100">
                    Password
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      {...register("password", validationRules.password)}
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white outline-none transition focus:border-green-400 focus:bg-white/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-200 transition hover:text-white"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  <p className="mt-1 min-h-[16px] text-[11px] font-medium text-red-300">
                    {errors.password?.message}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold tracking-wide text-gray-100">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-green-300"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      {...register("confirmPassword", validationRules.confirmPassword)}
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white outline-none transition focus:border-green-400 focus:bg-white/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-200 transition hover:text-white"
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>
                  <p className="mt-1 min-h-4 text-[11px] font-medium text-red-300">
                    {errors.confirmPassword?.message}
                  </p>
                </div>
              </div>

              <button className="w-full rounded-xl bg-white py-2.5 text-sm font-bold text-gray-900 shadow-lg transition hover:bg-green-50">
                Register
              </button>

              <p className="text-center text-sm sm:text-sm text-gray-200">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-yellow-300 underline decoration-transparent transition hover:decoration-yellow-300"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;