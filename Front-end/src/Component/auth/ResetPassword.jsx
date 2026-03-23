import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const passwordValue = watch("password");

  const passwordValidation = {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
    validate: {
      hasUpperCase: (value) =>
        /[A-Z]/.test(value) || "Password must contain at least 1 uppercase letter",
      hasLowerCase: (value) =>
        /[a-z]/.test(value) || "Password must contain at least 1 lowercase letter",
      hasNumber: (value) =>
        /[0-9]/.test(value) || "Password must contain at least 1 number",
      hasSymbol: (value) =>
        /[!@#$%^&*(),.?":{}|<>_\-\\[\]/`~+=;' ]/.test(value) ||
        "Password must contain at least 1 special character",
    },
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await axios.put("/resetpassword", {
        token,
        newPassword: data.password,
      });

      setMessage({
        type: "success",
        text: "Password reset successfully! Redirecting to login...",
      });

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Token is invalid or expired",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>Enter your new password</p>

        {message.text && (
          <div
            style={{
              ...styles.alert,
              ...(message.type === "success" ? styles.successAlert : styles.errorAlert),
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                style={{
                  ...styles.input,
                  ...(errors.password ? styles.inputError : {}),
                }}
                {...register("password", passwordValidation)}
              />
              <span
                style={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && (
              <span style={styles.errorText}>{errors.password.message}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                style={{
                  ...styles.input,
                  ...(errors.confirmPassword ? styles.inputError : {}),
                }}
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (value) =>
                    value === passwordValue || "Passwords do not match",
                })}
              />
              <span
                style={styles.eyeIcon}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.confirmPassword && (
              <span style={styles.errorText}>{errors.confirmPassword.message}</span>
            )}
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Updating..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "8px",
    fontSize: "24px",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "20px",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "600",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "12px 40px 12px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
  },
  inputError: {
    borderColor: "red",
  },
  eyeIcon: {
    position: "absolute",
    right: "12px",
    cursor: "pointer",
    color: "#666",
    fontSize: "16px",
  },
  errorText: {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
  },
  button: {
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
  },
  alert: {
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    textAlign: "center",
    fontSize: "14px",
  },
  successAlert: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  errorAlert: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
};