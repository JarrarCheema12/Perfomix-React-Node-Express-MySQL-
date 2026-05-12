import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import for navigation
import axios from "axios";
import { Button, TextInput } from "flowbite-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import image from "../assets/Rectangle 6052.png";

export default function CreateOrganization() {
  const navigate = useNavigate(); // Initialize navigation hook

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    email: "",
    phone: "",
    startDate: "",
    address: "",
    webURL: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSignup = async () => {
    const { name, type, email, phone, startDate, address, webURL } = formData;
  
    // Validate fields
    if (!name || !type || !email || !phone || !startDate || !address || !webURL) {
      toast.error("All fields are required!", { position: "top-right", autoClose: 3000 });
      return;
    }
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address!", { position: "top-right", autoClose: 3000 });
      return;
    }
  
    // Get token from localStorage
    const token = localStorage.getItem("token"); // Assuming token is stored under the key 'token'
  console.log('token :' , token);
  
    try {
      const response = await axios.post(
        "http://localhost:8080/organization/create-organization", 
        {
          name,
          type,
          email,
          phone,
          startDate,
          address,
          webURL,
        },
        {
          headers: {
            Authorization: `${token}`, // Attach the token in the Authorization header
          },
        }
      );
  
      toast.success("Organization registered successfully!", { position: "top-right", autoClose: 2000 });
  
      // Navigate to the organization dashboard after successful registration
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Organization Failed!", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Organization error:", error.response?.data || error.message);
    }
  };
  

  return (
    <div className="flex h-screen">
      <ToastContainer />

      {/* Left Section (Form) */}
      <div className="flex flex-1 justify-center items-center">
        <div className="w-full max-w-2xl bg-white rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Register Your Organization</h1>
          <p className="text-center text-gray-600 mb-8">Please enter organization details.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <TextInput id="name" type="text" placeholder="Enter organization name" value={formData.name} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="type" className="block mb-1 text-sm font-medium text-gray-700">
                Organization Type
              </label>
              <TextInput id="type" type="text" placeholder="Enter organization type" value={formData.type} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                Email Address
              </label>
              <TextInput id="email" type="email" placeholder="contact@company.com" value={formData.email} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="phone" className="block mb-1 text-sm font-medium text-gray-700">
                Phone
              </label>
              <TextInput id="phone" type="tel" placeholder="123-456-7890" value={formData.phone} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="startDate" className="block mb-1 text-sm font-medium text-gray-700">
                Start Date
              </label>
              <TextInput id="startDate" type="date" value={formData.startDate} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="address" className="block mb-1 text-sm font-medium text-gray-700">
                Address
              </label>
              <TextInput id="address" type="text" placeholder="123 Business St, City, Country" value={formData.address} onChange={handleChange} />
            </div>

            <div>
              <label htmlFor="webURL" className="block mb-1 text-sm font-medium text-gray-700">
                Website URL
              </label>
              <TextInput id="webURL" type="text" placeholder="https://company.com" value={formData.webURL} onChange={handleChange} />
            </div>
          </div>

          <div className="mt-6">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={handleSignup}>
              Register Organization
            </Button>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-100">
        <img src={image} alt="Signup Illustration" className="object-cover w-full h-full" />
      </div>
    </div>
  );
}
