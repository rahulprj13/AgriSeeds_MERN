// import React, { createContext, useState, useEffect } from "react";
// import axios from "axios";

// export const AuthContext = createContext();

// const AuthContextProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     try {
//       const raw = sessionStorage.getItem("user");
//       return raw ? JSON.parse(raw) : null;
//     } catch {
//       return null;
//     }
//   });

//   const [token, setToken] = useState(() => sessionStorage.getItem("token") || null);
//   const [loading, setLoading] = useState(true);
//   const API_URL = "http://localhost:5000";

//   const normalizeUser = (u) => {
//     if (!u) return null;
//     const profileImage = u.profileImage
//       ? u.profileImage.startsWith("http")
//         ? u.profileImage
//         : `${API_URL}/uploads/${u.profileImage}`
//       : null;
//     return { ...u, profileImage };
//   };

//   const fetchUser = async () => {
//     try {
//       const res = await axios.get("/profile");

//       const profileData = res.data.user || res.data;
//       const normalized = normalizeUser(profileData);

//       setUser(normalized);
//       sessionStorage.setItem("user", JSON.stringify(normalized));
//     } catch (error) {
//       console.log("User fetch error:", error);
//       logout();
//     }
//   };

//   const login = async (data) => {
//     try {
//       const res = await axios.post("/login", data);

//       if (res.status === 200) {
//         const token = res.data.token;
//         const loggedInUser = res.data.user || null;

//         sessionStorage.setItem("token", token);
//         localStorage.removeItem("token");

//         setToken(token);
//         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//         if (loggedInUser) {
//           const normalized = normalizeUser(loggedInUser);
//           setUser(normalized);
//           sessionStorage.setItem("user", JSON.stringify(normalized));
//         }

//         return res.data;
//       }
//     } catch (error) {
//       throw error;
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     sessionStorage.removeItem("token");
//     sessionStorage.removeItem("user");

//     setToken(null);
//     setUser(null);

//     delete axios.defaults.headers.common["Authorization"];
//   };

//   useEffect(() => {
//     const storedToken = sessionStorage.getItem("token");

//     if (storedToken) {
//       setToken(storedToken);
//       axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

//       fetchUser().finally(() => {
//         setLoading(false);
//       });
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, setUser, token, login, logout, fetchUser }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContextProvider;