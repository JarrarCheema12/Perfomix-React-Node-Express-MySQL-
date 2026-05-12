import { useState, useRef, useEffect } from "react";
import { TextInput, Button } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams , useLocation } from "react-router-dom";
import image from "../assets/Rectangle 6052.png";
import axios from "axios";

export default function OTPVerification({route}) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const { state } = useLocation(); // Get token from URL params
  console.log('token :' , state);
  const {token } =state ;
  console.log( token);
  
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-focus the first input field on component mount
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleVerify = async () => {
    if (otp.some((digit) => digit === "")) {
      toast.error("Please enter all 4 digits!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
  
    const otpValue = otp.join(""); // Fixed variable name
    console.log("otp: ", otpValue);
  
    try {
      const response = await axios.post(
        "http://localhost:8080/user/verify-otp", 
        {otp:otpValue} , // This is the correct way to send the body
        {
            headers: {
              Authorization: `${token}`, // Fix the template string syntax
            },
        }
    );

    console.log("Response: ", response);
  
      if (!response.data.success) {
        toast.error(response.data.message, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
  
      toast.success("OTP verified successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
  
      // Navigate to the new password screen after successful verification
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  
  

  const handleOtpChange = (e, index) => {
    const value = e.target.value;

    if (!/^\d?$/.test(value)) return; // Only allow single digit numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if a number is entered
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex h-screen">
      <ToastContainer /> {/* Toast container for notifications */}

      {/* Left Section (OTP Form) */}
      <div className="flex flex-1 flex-col justify-center px-12 bg-white">
        <div className="max-w-sm mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            Verify your identity
          </h1>
          <p className="text-gray-600 mb-6">
            Enter the 4-digit code sent to your email to verify your identity.
          </p>

          {/* OTP Input */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="text-center w-full h-12 text-lg font-semibold rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium" onClick={handleVerify}>
            Verify
          </Button>

          {/* Resend OTP */}
          <div className="mt-6 text-sm text-center text-gray-700">
            Didn’t receive a code?{" "}
            <button className="font-medium text-blue-500 hover:underline">
              Resend
            </button>
          </div>
        </div>
      </div>

      {/* Right Section (Image) */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-100">
        <img
          src={image}
          alt="Verification Illustration"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
}
