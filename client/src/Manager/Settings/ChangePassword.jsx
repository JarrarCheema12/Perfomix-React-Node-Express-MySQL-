// src/components/ChangePassword.js

import React, { useState } from "react";
import { Label, TextInput, Button } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = localStorage.getItem("token");

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:8080/user/reset-password`,
        { oldPassword: currentPassword, newPassword: newPassword }
        ,{
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.data.message || "Failed to update password.");
      }
    } catch (error) {
      toast.error("Error updating password.");
      console.error("Password Update Error:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row mt-16 md:space-x-4">
        <div>
          <h3 className="text-lg font-semibold">Password</h3>
          <p className="text-sm text-gray-500">
            Please enter your current password to change your password.
          </p>
        </div>
        <div className="w-full bg-white rounded-lg p-5">
          <div className="grid w-full grid-cols-1 gap-4 mt-4">
            <div>
              <Label htmlFor="current-password" value="Current Password" />
              <TextInput
                id="current-password"
                type="password"
                sizing="md"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="new-password" value="New Password" />
              <TextInput
                id="new-password"
                type="password"
                sizing="md"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" value="Confirm New Password" />
              <TextInput
                id="confirm-password"
                type="password"
                sizing="md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <Button color="gray">Cancel</Button>
            <Button color="blue" onClick={handlePasswordUpdate}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
  );
};

export default ChangePassword;
