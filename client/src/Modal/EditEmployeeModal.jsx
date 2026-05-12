import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Label } from "flowbite-react";

const EditEmployeeModal = ({ isOpen, onClose, employee }) => {
  console.log("Employee Data:", employee);

  // Initialize formData with employee data
  const [formData, setFormData] = useState({
    user: employee?.user || "",
    email: employee?.email || "",
    userRole: employee?.userRole || "",
    designation: employee?.designation || "",
    phone: employee?.phone || "",
  });

  // Update formData when employee prop changes
  useEffect(() => {
    if (employee) {
      setFormData({
        user: employee.user,
        email: employee.email,
        userRole: employee.userRole,
        designation: employee.designation,
        phone: employee.phone,
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal
      show={isOpen}
      size="xl"
      onClose={onClose}
      popup
      className="backdrop:bg-black/50" // Dark overlay
    >
      <Modal.Header />
      <Modal.Body>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Edit Employee
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="user" value="Full Name" />
            <TextInput
              id="user"
              name="user"
              value={formData.user}
              placeholder="Enter full name"
              required
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="email" value="Email Address" />
            <TextInput
              id="email"
              name="email"
              type="email"
              value={formData.email}
              placeholder="Enter email address"
              required
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="userRole" value="User Role" />
            <TextInput
              id="userRole"
              name="userRole"
              value={formData.userRole}
              placeholder="Enter role (e.g., Admin, Developer)"
              required
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="designation" value="Designation" />
            <TextInput
              id="designation"
              name="designation"
              value={formData.designation}
              placeholder="Enter designation (e.g., Manager, Engineer)"
              required
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="phone" value="Phone" />
            <TextInput
              id="phone"
              name="phone"
              value={formData.phone}
              placeholder="Enter phone number"
              required
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-3">
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button color="blue">Save</Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default EditEmployeeModal;
