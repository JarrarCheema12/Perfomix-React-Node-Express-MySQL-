import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, Label } from "flowbite-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditDepartmentModal = ({ isOpen, onClose, departmentData }) => {
  console.log("Data:", departmentData);

  // Initialize formData with department data
  const [formData, setFormData] = useState({
    deptId: departmentData?.dept_id || "",
    departmentName: departmentData?.department_name || "",
    departmentId: departmentData?.department_id || "",
  });

  const [errors, setErrors] = useState({}); // State for validation errors

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (departmentData) {
      setFormData({
        deptId: departmentData.dept_id,
        departmentName: departmentData.department_name,
        departmentId: departmentData.department_id,
      });
    }
  }, [departmentData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error when user types
  };

  // Validation Function
  const validate = () => {
    let newErrors = {};

    if (!formData.departmentName.trim()) {
      newErrors.departmentName = "Department name is required.";
    } else if (formData.departmentName.length < 3) {
      newErrors.departmentName = "Department name must be at least 3 characters.";
    } else if (formData.departmentName.length > 50) {
      newErrors.departmentName = "Department name must be less than 50 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  // Handle Save logic
  const handleSave = async () => {
    if (!validate()) return; // Prevent API call if validation fails

    try {
      const response = await axios.put(
        `http://localhost:8080/department/update-department/${formData.deptId}`,
        { department_name: formData.departmentName },
        { headers: { Authorization: `${token}` } }
      );

      if (response.data.success) {
        toast.success("Department updated successfully!", { position: "top-right", autoClose: 1500 });
        setTimeout(() => onClose(), 1500);
      } else {
        toast.error("Failed to update department.");
      }
    } catch (error) {
      console.error("Error updating department:", error);
      toast.error("Error updating department.");
    }
  };

  return (
    <Modal show={isOpen} size="lg" onClose={onClose} popup className="bg-gray-100">
      <Modal.Header />
      <Modal.Body>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Department</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="deptId" value="Department ID" />
            <TextInput id="deptId" name="deptId" value={formData.departmentId} readOnly />
          </div>

          <div>
            <Label htmlFor="departmentName" value="Department Name" />
            <TextInput
              id="departmentName"
              name="departmentName"
              value={formData.departmentName}
              placeholder="Enter department name"
              required
              onChange={handleChange}
            />
            {errors.departmentName && (
              <p className="text-red-500 text-sm mt-1">{errors.departmentName}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <Button color="gray" onClick={onClose}>Cancel</Button>
          <Button color="blue" onClick={handleSave}>Save</Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default EditDepartmentModal;
