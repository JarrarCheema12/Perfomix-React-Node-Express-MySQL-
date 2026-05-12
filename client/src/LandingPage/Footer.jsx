import { Footer as FlowbiteFooter, TextInput, Button } from "flowbite-react";
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";

export default function CustomFooter() {
  return (
    <FlowbiteFooter container className="bg-[#485e68] text-white">
      <div className="w-full">
        <div className="grid w-full sm:flex sm:justify-between">
          {/* Left Section */}
          <div className="flex flex-col space-y-4 sm:w-1/3">
            <h3 className="text-lg font-bold">Subscribe to our Newsletter</h3>
            <p className="text-gray-200">
              Subscribe to our newsletter and unlock a world of exclusive benefits. Join our community of 
              like-minded individuals who share a passion for performance management solutions.
            </p>
            <div className="flex space-x-4 mt-4">
              <FlowbiteFooter.Icon href="#" icon={BsFacebook} className="text-gray-300 hover:text-white" />
              <FlowbiteFooter.Icon href="#" icon={BsInstagram} className="text-gray-300 hover:text-white" />
              <FlowbiteFooter.Icon href="#" icon={BsTwitter} className="text-gray-300 hover:text-white" />
              <FlowbiteFooter.Icon href="#" icon={BsGithub} className="text-gray-300 hover:text-white" />
              <FlowbiteFooter.Icon href="#" icon={BsDribbble} className="text-gray-300 hover:text-white" />
            </div>
          </div>

          {/* Right Section */}
          <div className="mt-8 sm:mt-0 sm:w-1/3 flex flex-col space-y-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-200">
              Enter your email
            </label>
            <div className="flex items-center space-x-2">
              <TextInput
                id="email"
                type="email"
                placeholder="your.email@example.com"
                required
                className="w-full bg-gray-700 text-white border-gray-500 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

      
      </div>
    </FlowbiteFooter>
  );
}
