import React from "react";
import { Modal, Button, TextInput, Label } from "flowbite-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AddEmployeeModal = ({ isOpen, onClose, selectedDepartment }) => {
  console.log("Selected department:", selectedDepartment);

  const token = localStorage.getItem("token");

  // Validation Schema using Yup
  const validationSchema = Yup.object().shape({
    full_name: Yup.string()
      .min(3, "Full name must be at least 3 characters")
      .required("Full name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
      role_id: Yup.number()
      .typeError("Role must be a number")
      .integer("Role ID must be an integer")
      .min(1, "Role ID must be at least 1")
      .max(3, "Role ID must not be greater than 3") // Ensures the role_id is not greater than 3
      .positive("Role ID must be positive")
      .required("Role ID is required"),
    
    designation: Yup.string().required("Designation is required"),
    phone: Yup.string()
      .matches(/^[0-9]{11}$/, "Invalid phone number")
      .required("Phone number is required"),
  });

  // Handle Form Submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    if (!token || !selectedDepartment) {
      toast.error("Token or Department ID missing.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/user/register-employee",
        { ...values, department_id: selectedDepartment },
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Employee added successfully!");
        resetForm(); // Reset form fields
        onClose(); // Close modal
      } else {
        toast.error(response.data.message || "Failed to add employee.");
      }
    } catch (error) {
      toast.error("Error adding employee.");
      console.error("Error adding employee:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal show={isOpen} size="xl" onClose={onClose} popup className="bg-gray-100">
        <Modal.Header />
        <Modal.Body>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Employee</h3>

          <Formik
            initialValues={{
              full_name: "",
              email: "",
              role_id: "",
              designation: "",
              phone: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="grid grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <Label htmlFor="full_name" value="Full Name" />
                  <Field as={TextInput} id="full_name" name="full_name" placeholder="Enter full name" />
                  <ErrorMessage name="full_name" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" value="Email Address" />
                  <Field as={TextInput} id="email" name="email" type="email" placeholder="Enter email" />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Role ID */}
                <div>
                  <Label htmlFor="role_id" value="User Role 1.Admin 2.Manager 3.Staff" />
                  <Field as={TextInput} id="role_id" name="role_id" type="number" placeholder="Enter role ID" />
                  <ErrorMessage name="role_id" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Designation */}
                <div>
                  <Label htmlFor="designation" value="Designation" />
                  <Field as={TextInput} id="designation" name="designation" placeholder="Enter designation" />
                  <ErrorMessage name="designation" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" value="Phone" />
                  <Field as={TextInput} id="phone" name="phone" placeholder="Enter phone number" />
                  <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Buttons */}
                <div className="col-span-2 flex justify-end mt-6 space-x-3">
                  <Button color="gray" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" color="blue" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
};

export default AddEmployeeModal;
