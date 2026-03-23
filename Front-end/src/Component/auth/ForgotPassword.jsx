import axios from 'axios';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

export const ForgotPassword = () => {
    const { register, handleSubmit,formState:{ errors } } = useForm();

    const navigate = useNavigate();

  const submitHandler = async (data) => {
    console.log(data);
    const res = await axios.post("/forgotpassword", data);
    console.log(res.data);

    if(res.status === 200){
        alert("Reset link sent to your email!");
        navigate("/login");
      }
    
}

  return (
    <div style={styles.container}>
      <h2>Forgot Password?</h2>
      <p>Enter your email and we'll send you a link to reset your password.</p>
      
      <form onSubmit={handleSubmit(submitHandler)} style={styles.form}>
        <input
          type="email"
          placeholder="Enter your email"
          {...register("email", { required: "Email is required" })}

          style={styles.input}
        />
        {errors.email && <p style={styles.error}>{errors.email.message}</p>}
        <button type="submit" style={styles.button}>Send Reset Link</button>
      </form>
      
      <a href="/login" style={styles.link}>Back to Login</a>
    </div>
  );
};

// Simple inline styles for demonstration
const styles = {
  container: { maxWidth: '400px', margin: '50px auto', textAlign: 'center', fontFamily: 'Arial' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error: { color: 'red', fontSize: '14px' },
  link: { marginTop: '20px', display: 'block', color: '#007bff', textDecoration: 'none' }
};

