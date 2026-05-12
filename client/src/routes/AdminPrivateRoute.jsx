import React from "react";
import { Navigate } from "react-router-dom";

const isAdminAuthenticated = () => {
  const token = localStorage.getItem("token");
  
  return token !== null;
};

const AdminPrivateRoute = ({ children }) => {
  console.log("Admin Authenticated:", isAdminAuthenticated());
  
  
  return isAdminAuthenticated() ? children : <Navigate to="/login" />;
};

export default AdminPrivateRoute;
