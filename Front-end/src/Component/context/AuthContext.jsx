import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // FETCH USER FROM BACKEND
  const fetchUser = async () => {

    try {

      const res = await axios.get("/profile");

      setUser(res.data);

    } catch (error) {

      console.log("User fetch error:", error);

      logout();

    }

  };

  // LOGIN FUNCTION
  const login = async (data) => {

    try {

      const res = await axios.post("/login", data);

      if (res.status === 200) {

        const token = res.data.token;

        localStorage.setItem("token", token);

        setToken(token);

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // 👇 LOGIN KE BAAD USER FETCH
        await fetchUser();

        return res.data;

      }

    } catch (error) {

      throw error;

    }

  };

  // LOGOUT FUNCTION
  const logout = () => {

    localStorage.removeItem("token");

    setToken(null);

    setUser(null);

    delete axios.defaults.headers.common["Authorization"];

  };

  // AUTO LOGIN
  useEffect(() => {

    const storedToken = localStorage.getItem("token");

    if (storedToken) {

      setToken(storedToken);

      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

      fetchUser();

    }

    setLoading(false);

  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;