import { useNavigate } from "react-router-dom"; // Import useNavigate from React Router
import NavBar from "./NavBar";
import Footer from "./Footer";
import image from '../assets/Digital_presentation_1_.png';
import { Button } from "flowbite-react";

export default function LandingPage() {
  const navigate = useNavigate(); // Initialize navigate function

  const handleGetStartedClick = () => {
    navigate("/login"); // Navigate to the signup page
  };

  return (
    <div>
      {/* NavBar */}
      <NavBar />

      {/* Main Section */}
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-center space-x-8 p-4 max-w-screen-xl mx-auto">
          {/* Text */}
          <div className="text-center md:text-left md:w-1/2">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Empowering Your Performance
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Unlock your team's potential with Performix - the ultimate performance management solution.
            </p>
            <div className="flex justify-center md:justify-start">
              {/* "Get Started" button with navigation */}
              <button type="button" 
              class="text-white bg-gray-600 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={handleGetStartedClick}>
                Get Started
                </button>
            </div>
          </div>

          {/* Image */}
          <div className="md:w-1/2 mt-8 md:mt-0">
            <img
              src={image}
              alt="Landing Page Image"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
