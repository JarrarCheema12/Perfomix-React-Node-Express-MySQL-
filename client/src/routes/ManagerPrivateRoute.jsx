import React from "react";
import { Navigate } from "react-router-dom";

const isManagerAuthenticated = () => {
  const token = localStorage.getItem("Managertoken");
  return !!token;
};

const ManagerPrivateRoute = ({ children }) => {
  return isManagerAuthenticated() ? children : <Navigate to="/login" />;
};

export default ManagerPrivateRoute;
