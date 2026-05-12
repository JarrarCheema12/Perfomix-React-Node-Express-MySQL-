import React from "react";
import { Modal, Button, Textarea } from "flowbite-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AddEmployeeEvaluationModal = ({ isOpen, onClose, employeeId, metricId, parameterId }) => {
  // Retrieve token from localStorage
  const token = localStorage.getItem("token");

  // Validation Schema using Yup
  const validationSchema = Yup.object().shape({
    marksObt: Yup.number()
      .typeError("Marks must be a number")
      .positive("Marks must be positive")
      .required("Marks are required"),
    feedback: Yup.string()
      .min(10, "Feedback must be at least 10 characters")
      .required("Feedback is required"),
  });

  // Handle Form Submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/user/evaluate-employee",
        {
          employee_id: employeeId,
          metric_id: metricId,
          parameter_id: parameterId,
          marks_obt: values.marksObt,
          feedback: values.feedback,
        },
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Evaluation added successfully!");
        resetForm(); // Reset form fields
        onClose(); // Close modal
      } else {
        toast.error(response.data.message || "Failed to add evaluation.");
      }
    } catch (error) {
      toast.error("Error submitting evaluation.");
      console.error("Error submitting evaluation:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal show={isOpen} onClose={onClose} size="md" className="bg-gray-100">
        <Modal.Header>Add Evaluation</Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ marksObt: "", feedback: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <p className="text-md">Employee ID: {employeeId}</p>
                <p className="text-md">Metric ID: {metricId}</p>
                <p className="text-md">Parameter ID: {parameterId}</p>

                {/* Marks Input */}
                <div>
                  <Field
                    type="number"
                    name="marksObt"
                    className="w-full border-gray-300 rounded-md p-2"
                    placeholder="Enter Marks Obtained"
                  />
                  <ErrorMessage name="marksObt" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Feedback Input */}
                <div>
                  <Field
                    as={Textarea}
                    name="feedback"
                    placeholder="Enter feedback..."
                    className="w-full border-gray-300 rounded-md p-2"
                  />
                  <ErrorMessage name="feedback" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2">
                  <Button onClick={onClose} color="gray">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
};

export default AddEmployeeEvaluationModal;
