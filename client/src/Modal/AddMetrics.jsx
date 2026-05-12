import React from "react";
import axios from "axios";
import { Modal, Button, TextInput, Label } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "react-toastify/dist/ReactToastify.css";

const AddMetrics = ({ isOpen, onClose }) => {
  const token = localStorage.getItem("token");

  const validationSchema = Yup.object({
    metric_name: Yup.string().required("Metric name is required"),
    metric_description: Yup.string().required("Metric description is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/performance/create-metric",
        values,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Metric added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setTimeout(() => {
        onClose();
      },[1500])
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add metric. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Performance Metric</h3>
          
          <Formik
            initialValues={{ metric_name: "", metric_description: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <Label htmlFor="metric_name" value="Metric Name" />
                    <Field
                      as={TextInput}
                      id="metric_name"
                      name="metric_name"
                      placeholder="Enter metric name"
                    />
                    <ErrorMessage name="metric_name" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="metric_description" value="Metric Description" />
                    <Field
                      as={TextInput}
                      id="metric_description"
                      name="metric_description"
                      placeholder="Enter metric description"
                    />
                    <ErrorMessage name="metric_description" component="div" className="text-red-500 text-sm" />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end mt-6 space-x-3">
                  <Button color="gray" onClick={onClose} type="button">
                    Cancel
                  </Button>
                  <Button color="blue" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
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

export default AddMetrics;
