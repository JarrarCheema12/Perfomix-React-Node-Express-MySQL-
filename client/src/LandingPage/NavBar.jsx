import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from React Router
import { Button, Navbar } from "flowbite-react";
import { FiX } from "react-icons/fi";
import logo from "../assets/Frame 1618873018.png";

export default function NavBar() {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const navigate = useNavigate(); // Initialize navigate function

  const handleAboutClick = () => {
    setIsAboutModalOpen(true);
  };

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAboutModalOpen(false);
    setIsContactModalOpen(false);
  };

  const handleLoginClick = () => {
    navigate("/login"); // Navigate to the login page
  };

 
  return (
    <>
      <Navbar
        fluid
        rounded
        className="bg-[#e8ecf4] shadow-md border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700"
      >
        <Navbar.Brand href="https://flowbite-react.com">
          <img
            src={logo}
            className="mr-3 h-12 sm:h-10 transition-transform hover:scale-110"
            alt="Performix Logo"
          />
          <span className="self-center whitespace-nowrap text-2xl font-bold text-gray-600 dark:text-white font-poppins text-shadow-lg">
            Performix
          </span>
        </Navbar.Brand>
        <div className="flex items-center md:order-2 bg-[#3b4c53] rounded-2xl">
          <Button
            className="font-bold text-white hover:bg-[#3b4c53] transition-all space-x-2 rounded-2xl px-4 shadow-lg"
            onClick={handleLoginClick} // Call handleLoginClick when button is clicked
          >
            Log In
          </Button>
         
        </div>
        
        <Navbar.Collapse className={`w-full flex flex-col md:flex-row items-center justify-center text-gray-600 ${open ? "block" : "hidden"} md:flex`}>
          <Navbar.Link href="#" className="text-lg font-bold font-poppins text-shadow-md">
            Home
          </Navbar.Link>
          <Navbar.Link href="#" className="text-lg font-bold font-poppins text-shadow-md" onClick={handleAboutClick}>
            About
          </Navbar.Link>
          <Navbar.Link href="#" className="text-lg text-custom-blue font-bold font-poppins text-shadow-md" onClick={handleContactClick}>
            Contact
          </Navbar.Link>
        </Navbar.Collapse>

      </Navbar>

      {/* About Modal */}
      {isAboutModalOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-start z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96 mt-24"
            onClick={(e) => e.stopPropagation()}
          >
            <FiX
              className="absolute top-4 right-4 w-6 h-6 text-[#485e68] cursor-pointer"
              onClick={handleCloseModal}
            />
            <h2 className="text-2xl font-semibold mb-4 text-[#485e68]">About Performix</h2>
            <p className="text-[#485e68]">
              We are Performix, a forward-thinking organization focused on delivering top-notch performance management solutions.
            </p>
            <ul className="list-disc pl-5 mt-4 text-[#485e68]">
              <li>Founded in 2024</li>
              <li>Specializing in performance metrics and employee management solutions</li>
              <li>Dedicated to user-friendly, customizable software</li>
            </ul>
            <div className="mt-4 flex justify-end">
              <Button className="text-[#485e68]" onClick={handleCloseModal}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-start z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96 mt-24"
            onClick={(e) => e.stopPropagation()}
          >
            <FiX
              className="absolute top-4 right-4 w-6 h-6 text-[#485e68] cursor-pointer"
              onClick={handleCloseModal}
            />
            <h2 className="text-2xl font-semibold mb-4 text-[#485e68]">Contact Us</h2>
            <p className="text-[#485e68]">
              We'd love to hear from you! Whether you have questions about our platform, need support, or just want to provide feedback, feel free to reach out.
            </p>
            <p className="text-[#485e68]"><strong>Contact Info:</strong></p>
            <p className="text-[#485e68]">
              Email:{" "}
              <a href="mailto:customerservice@performix.com" className="text-blue-500">
                customerservice@performix.com
              </a>
            </p>
            <div className="mt-4 flex justify-end">
              <Button className="text-[#485e68]" onClick={handleCloseModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
