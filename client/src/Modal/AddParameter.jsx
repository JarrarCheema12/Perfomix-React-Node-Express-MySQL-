import React from "react";
import axios from "axios";
import { Modal, Button, TextInput, Label } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "react-toastify/dist/ReactToastify.css";

const AddParameter = ({ isOpen, onClose, id }) => {
  console.log("id", id);

  const token = localStorage.getItem("token");

  const validationSchema = Yup.object({
    parameter_name: Yup.string().required("Parameter name is required"),
    parameter_description: Yup.string().required("Description is required"),
    weightage: Yup.number()
      .typeError("Weightage must be a number")
      .required("Weightage is required")
      .min(0, "Weightage cannot be negative"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await axios.post(
        `http://localhost:8080/performance/create-parameter/${id}`,
        values,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Parameter added successfully!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      resetForm();
      setTimeout(() => {
        onClose();
      }, [1500])
   
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add parameter. Please try again.", {
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Parameter</h3>
          
          <Formik
            initialValues={{ parameter_name: "", parameter_description: "", weightage: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <Label htmlFor="parameter_name" value="Parameter Name" />
                    <Field as={TextInput} id="parameter_name" name="parameter_name" placeholder="Enter parameter name" />
                    <ErrorMessage name="parameter_name" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="parameter_description" value="Description" />
                    <Field as={TextInput} id="parameter_description" name="parameter_description" placeholder="Enter description" />
                    <ErrorMessage name="parameter_description" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="weightage" value="Weightage" />
                    <Field as={TextInput} id="weightage" name="weightage" placeholder="Enter weightage" type="number" />
                    <ErrorMessage name="weightage" component="div" className="text-red-500 text-sm" />
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

export default AddParameter;
