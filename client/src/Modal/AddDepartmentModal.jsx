import React, { useState } from "react";
import { Modal, Button, TextInput, Label, Textarea } from "flowbite-react";
import axios from "axios";
import AddEmployeeModal from "./AddEmployeeModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AddDepartmentModal = ({ isOpen, onClose }) => {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  const token = localStorage.getItem("token");
  const organizationId = localStorage.getItem("selectedOrganizationId");

  // ✅ Full Validation Schema using Yup
  const validationSchema = Yup.object().shape({
    department: Yup.string()
      .min(3, "Department name must be at least 3 characters")
      .max(50, "Department name must be less than 50 characters")
      .required("Department name is required"),
    
    departmentId: Yup.string()
      .matches(/^[a-zA-Z0-9]+$/, "Department ID must be alphanumeric (letters & numbers only)")
      .min(3, "Department ID must be at least 3 characters")
      .max(20, "Department ID must be less than 20 characters")
      .required("Department ID is required"),

    departmentCode: Yup.string()
      .matches(/^[A-Z]{5}$/, "Department Code must be exactly 5 uppercase letters (e.g., 'FINHR')")
      .required("Department Code is required"),
    
    description: Yup.string()
      .max(200, "Description must be less than 200 characters"),
  });

  const handleSave = async (values, { setSubmitting, resetForm }) => {
    try {
      // Pre-validation check before API call
      if (!values.department || !values.departmentId || !values.departmentCode) {
        toast.error("Please fill out all required fields.");
        return;
      }

      const response = await axios.post(
        "http://localhost:8080/department/create-department",
        {
          department_name: values.department,
          department_id: values.departmentId,
          department_code: values.departmentCode,
          description: values.description,
          organization_id: organizationId,
        },
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Department created successfully!", {
          position: "top-right",
          autoClose: 1500,
        });

        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      } else {
        toast.error("Failed to create department: " + response.data.message);
      }
    } catch (error) {
      console.error("Error creating department:", error);
      toast.error("An error occurred while creating the department.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        show={isOpen}
        size="lg"
        onClose={onClose}
        popup
        position="center"
        className="bg-gray-100"
      >
        <Modal.Header />
        <Modal.Body>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Add Department
          </h3>

          <Formik
            initialValues={{
              department: "",
              departmentId: "",
              departmentCode: "",
              description: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSave}
          >
            {({ isSubmitting, isValid, dirty }) => (
              <Form className="grid gap-4 lg:grid-cols-2">
                
                {/* Department Name */}
                <div>
                  <Label htmlFor="department" value="Department Name" />
                  <Field
                    as={TextInput}
                    id="department"
                    name="department"
                    placeholder="Enter department name"
                    required
                  />
                  <ErrorMessage
                    name="department"
                    component="p"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Department ID */}
                <div>
                  <Label htmlFor="departmentId" value="Department ID" />
                  <Field
                    as={TextInput}
                    id="departmentId"
                    name="departmentId"
                    placeholder="Unique Department ID"
                    required
                  />
                  <ErrorMessage
                    name="departmentId"
                    component="p"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Department Code */}
                <div>
                  <Label htmlFor="departmentCode" value="Department Code" />
                  <Field
                    as={TextInput}
                    id="departmentCode"
                    name="departmentCode"
                    placeholder="e.g., FINHR (5 uppercase letters)"
                    required
                  />
                  <ErrorMessage
                    name="departmentCode"
                    component="p"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Description (Optional) */}
                <div className="lg:col-span-2">
                  <Label htmlFor="description" value="Description (Optional)" />
                  <Field
                    as={Textarea}
                    id="description"
                    name="description"
                    placeholder="Enter department description (max 200 characters)"
                  />
                  <ErrorMessage
                    name="description"
                    component="p"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Add Employee Button */}
               

                {/* Buttons */}
                <div className="flex justify-end mt-6 space-x-3 col-span-2">
                  <Button color="gray" onClick={onClose} type="button">
                    Cancel
                  </Button>
                  <Button
                    color="blue"
                    type="submit"
                    disabled={!isValid || !dirty || isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      <AddEmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
      />
    </>
  );
};

export default AddDepartmentModal;
