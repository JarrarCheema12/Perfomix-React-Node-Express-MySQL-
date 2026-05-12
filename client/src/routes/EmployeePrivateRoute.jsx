import React from "react";
import { Navigate } from "react-router-dom";

const isEmployeeAuthenticated = () => {
  const isStaff = localStorage.getItem("Stafftoken");
  const isManager = localStorage.getItem("Managertoken");

  // Ensure isStaff is not null or undefined, and isManager is not present
  return !!isStaff && !isManager;
};

const EmployeePrivateRoute = ({ children }) => {
  console.log("Employee Authenticated:", isEmployeeAuthenticated());
  
  return isEmployeeAuthenticated() ? children : <Navigate to="/login" />;
};

export default EmployeePrivateRoute;
