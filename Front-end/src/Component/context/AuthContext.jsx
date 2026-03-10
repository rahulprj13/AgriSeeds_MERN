import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token") || null
  );

  const [loading, setLoading] = useState(true);

  // FETCH USER
  const fetchUser = async () => {

    try {

      const res = await axios.get("/profile");

      setUser(res.data);

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
        const role = res.data.user.role;

        // ADMIN LOGIN
        if (role === "admin") {

          localStorage.setItem("token", token);
          sessionStorage.removeItem("token");

        } 
        
        // USER LOGIN
        else {

          sessionStorage.setItem("token", token);
          localStorage.removeItem("token");

        }

        setToken(token);

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        await fetchUser();

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

    setToken(null);
    setUser(null);

    delete axios.defaults.headers.common["Authorization"];

  };

  // AUTO LOGIN
  useEffect(() => {

    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
  
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