import React, { useEffect } from "react";
import { Modal, Button, TextInput, Label } from "flowbite-react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

const EditMetrics = ({ isOpen, onClose, departmentData }) => {
  console.log("Data:", departmentData.id);

  // Formik Setup
  const formik = useFormik({
    initialValues: {
      metric_name: departmentData?.metrics || "",
      metric_description: "",
    },
    validationSchema: Yup.object({
      metric_name: Yup.string()
        .trim()
        .min(3, "Metric name must be at least 3 characters")
        .max(50, "Metric name must be less than 50 characters")
        .required("Metric name is required"),
      metric_description: Yup.string()
        .trim()
        .max(100, "Metric description must be less than 100 characters"),
    }),
    onSubmit: async (values) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `http://localhost:8080/performance/update-metric/${departmentData.id}`,
          {
            metric_name: values.metric_name,
            metric_description: values.metric_description,
          },
          {
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          alert("Metric updated successfully!");
          onClose();
        } else {
          alert("Failed to update metric.");
        }
      } catch (error) {
        console.error("Error updating metric:", error);
        alert("An error occurred while updating the metric.");
      }
    },
  });

  useEffect(() => {
    if (departmentData) {
      formik.setValues({
        metric_name: departmentData.metrics || "",
        metric_description: "",
      });
    }
  }, [departmentData]);

  return (
    <Modal show={isOpen} size="lg" onClose={onClose} popup className="bg-gray-100">
      <Modal.Header />
      <Modal.Body>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Performance Metric</h3>
        <form onSubmit={formik.handleSubmit}>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <Label htmlFor="metric_name" value="Metric Name" />
              <TextInput
                id="metric_name"
                name="metric_name"
                value={formik.values.metric_name}
                placeholder="Enter metric name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.metric_name && formik.errors.metric_name && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.metric_name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="metric_description" value="Metric Description" />
              <TextInput
                id="metric_description"
                name="metric_description"
                value={formik.values.metric_description}
                placeholder="Enter metric description"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.metric_description && formik.errors.metric_description && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.metric_description}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-6 space-x-3">
            <Button color="gray" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button color="blue" type="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditMetrics;
