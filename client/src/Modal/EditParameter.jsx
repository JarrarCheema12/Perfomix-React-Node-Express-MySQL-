import React from "react";
import axios from "axios";
import { Modal, Button, TextInput, Label, Spinner } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const EditParameter = ({ isOpen, onClose, parameterData }) => {
  const token = localStorage.getItem("token");

  // Validation Schema
  const validationSchema = Yup.object({
    ParameterName: Yup.string()
      .trim()
      .min(3, "Parameter name must be at least 3 characters")
      .required("Parameter name is required"),
    Description: Yup.string()
      .trim()
      .min(5, "Description must be at least 5 characters")
      .required("Description is required"),
  });

  // Handle Form Submission
  const handleSubmit = async (values, { setSubmitting }) => {
    if (!token) {
      console.error("Token is missing.");
      toast.error("Authentication token is missing!");
      return;
    }

    if (!parameterData?.parameter_id) {
      console.error("Invalid parameter data.");
      toast.error("Invalid parameter details. Please try again.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/performance/edit-parameter/${parameterData.parameter_id}`,
        {
          parameter_name: values.ParameterName,
          parameter_description: values.Description,
        },
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Parameter updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });

      setTimeout(() => onClose(), 1000); // Delay closing for better UX
    } catch (error) {
      console.error("Error updating parameter:", error);
      toast.error("Failed to update parameter. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <Modal show={isOpen} size="lg" onClose={onClose} popup className="bg-gray-100">
        <Modal.Header />
        <Modal.Body>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Parameter</h3>

          <Formik
            initialValues={{
              ParameterName: parameterData?.parameter_name || "",
              Description: parameterData?.parameter_description || "",
            }}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Parameter Name */}
                  <div>
                    <Label htmlFor="ParameterName" value="Parameter Name" />
                    <Field
                      as={TextInput}
                      id="ParameterName"
                      name="ParameterName"
                      placeholder="Enter parameter name"
                    />
                    <ErrorMessage name="ParameterName" component="div" className="text-red-500 text-sm" />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="Description" value="Description" />
                    <Field
                      as={TextInput}
                      id="Description"
                      name="Description"
                      placeholder="Enter description"
                    />
                    <ErrorMessage name="Description" component="div" className="text-red-500 text-sm" />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end mt-6 space-x-3">
                  <Button color="gray" onClick={onClose} type="button">
                    Cancel
                  </Button>
                  <Button color="blue" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner size="sm" /> : "Update"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditParameter;
