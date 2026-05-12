import { useState } from "react";
import { Button, TextInput } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import image from "../assets/Rectangle 6052.png";

export default function EmployeeNamePass() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    // Validate if all fields are filled
    if (!username || !password || !confirmPassword || !verificationToken) {
      toast.error("All fields are required!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Validate if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      // Send the password reset request to the backend API
      const response = await axios.post(
        `http://localhost:8080/user/set-credentials`,
        { 
          verificationToken, 
          userName: username, // Changed to 'userName' as required by backend
          password
        }
      );

      // Show success toast
      toast.success("Username and Password set successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Redirect to login screen after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      // Handle errors, e.g., invalid verification code
      toast.error(
        error.response?.data?.message || "Error occurred, please try again.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      console.error("Error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex h-screen">
      <ToastContainer /> {/* Toast container for notifications */}

      {/* Left Section */}
      <div className="flex flex-1 flex-col justify-center items-center px-10 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Heading */}
          <h1 className="text-3xl font-bold text-center mb-4">
            Set Username & Password
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Please set a username and password to secure your account
          </p>

          {/* Verification Token Field */}
          <div className="mb-4">
            <label
              htmlFor="verification-token"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Verification Token
            </label>
            <TextInput
              id="verification-token"
              type="text"
              placeholder="Enter verification token"
              value={verificationToken}
              onChange={(e) => setVerificationToken(e.target.value)}
              required
            />
          </div>

          {/* Username Field */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <TextInput
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <TextInput
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label
              htmlFor="confirm-password"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <TextInput
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Set Password Button */}
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white mb-4"
            onClick={handleResetPassword}
          >
            Set Username & Password
          </Button>

          {/* Back to Login Link */}
          <div className="mt-6 text-sm text-center text-gray-700">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-500 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-100">
        <img
          src={image}
          alt="Password Reset Illustration"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
} 
