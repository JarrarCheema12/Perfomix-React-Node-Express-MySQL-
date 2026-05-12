import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { Button, TextInput } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import image from "../assets/Rectangle 6052.png";
import logo from "../assets/Social icon.png";

export default function Signup() {
  const navigate = useNavigate();
  
  const validationSchema = Yup.object().shape({
    fullname: Yup.string()
      .matches(/^[A-Za-z\s]+$/, "Full name must contain only letters")
      .max(20, "Full name must be at most 20 characters")
      .required("Full name is required"),
    username: Yup.string()
      .matches(/^[A-Za-z\s]+$/, "Username must contain only letters")
      .max(20, "Username must be at most 20 characters")
      .required("Username is required"),
    phone: Yup.string()
      .matches(/^\d{10}$/, "Phone number must be exactly 10 digits")
      .required("Phone number is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .matches(/[A-Z]/, "Must contain at least one uppercase letter")
      .matches(/[a-z]/, "Must contain at least one lowercase letter")
      .matches(/\d/, "Must contain at least one number")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
  });
  

  const formik = useFormik({
    initialValues: {
      fullname: "",
      username: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await axios.post("http://localhost:8080/user/register-user", values);
        const token = response.data.token;
        
        if (token) {
          localStorage.setItem("authToken", token);
          toast.success("Account created successfully! Redirecting...", { position: "top-right", autoClose: 2000 });
          navigate("/otp-verification", { state: { token, email: values.email } });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Signup failed!", { position: "top-right", autoClose: 3000 });
      }
    },
  });

  return (
    <div className="flex h-screen">
      <ToastContainer />

      {/* Left Section (Form) */}
      <div className="flex flex-1 justify-center items-center">
        <form className="w-full max-w-2xl bg-white rounded-lg p-8" onSubmit={formik.handleSubmit}>
          <h1 className="text-3xl font-bold text-center mb-2">Create new account</h1>
          <p className="text-center text-gray-600 mb-8">Please enter your details.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: "fullname", label: "Full Name", placeholder: "Hannah Green" },
              { id: "username", label: "Username", placeholder: "@hannahgreen76" },
              { id: "phone", label: "Phone", placeholder: "123 465 7890", type: "tel" },
              { id: "email", label: "Email Address", placeholder: "qwerty@gmail.com", type: "email" },
              { id: "password", label: "Password", placeholder: "qwerty@123", type: "password" },
              { id: "confirmPassword", label: "Confirm Password", placeholder: "qwerty@123", type: "password" },
            ].map(({ id, label, placeholder, type = "text" }) => (
              <div key={id}>
                <label htmlFor={id} className="block mb-1 text-sm font-medium text-gray-700">
                  {label}
                </label>
                <TextInput
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  value={formik.values[id]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched[id] && formik.errors[id] && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors[id]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              Sign Up
            </Button>
          </div>

          <div className="mt-4">
            <Button className="w-full border border-gray-300 text-gray-700 flex items-center justify-center gap-2" outline>
              <img src={logo} alt="Google" className="w-5 h-5 me-2" />
              Sign Up with Google
            </Button>
          </div>

          <div className="mt-6 text-sm text-center text-gray-700">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-blue-500 hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>

      {/* Right Section (Image) */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-100">
        <img src={image} alt="Signup Illustration" className="object-cover w-full h-full" />
      </div>
    </div>
  );
}

