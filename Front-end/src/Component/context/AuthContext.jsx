import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // IMPORTANT: use sessionStorage only (per-tab session)
  const [token, setToken] = useState(() => sessionStorage.getItem("token") || null);

  const [loading, setLoading] = useState(true);

  // FETCH USER
  const fetchUser = async () => {

    try {

      const res = await axios.get("/profile");

      setUser(res.data);
      sessionStorage.setItem("user", JSON.stringify(res.data));

    } catch (error) {

      console.log("User fetch error:", error);

      logout();

    }

  };

  // LOGIN
  const login = async (data) => {

    try {

      const res = await axios.post("/login", data);

      if (res.status === 200) {

        const token = res.data.token;
        const loggedInUser = res.data.user || null;
        // Tab-scoped auth (admin/user both stored per-tab)
        sessionStorage.setItem("token", token);
        // Clear any legacy cross-tab tokens
        localStorage.removeItem("token");

        setToken(token);

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Set user immediately from login response.
        // This prevents cart actions from failing if `/profile` has issues.
        if (loggedInUser) {
          setUser(loggedInUser);
          sessionStorage.setItem("user", JSON.stringify(loggedInUser));
        }

        return res.data;

      }

    } catch (error) {

      throw error;

    }

  };

  // LOGOUT
  const logout = () => {

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);

    delete axios.defaults.headers.common["Authorization"];

  };

  // AUTO LOGIN
  useEffect(() => {

    const storedToken = sessionStorage.getItem("token");
  
    if (storedToken) {
  
      setToken(storedToken);
  
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
  
      fetchUser().finally(() => {
        setLoading(false);
      });
  
    } else {
      setLoading(false);
    }
  
  }, []);


  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;