import React from "react";
import { Modal, Button, TextInput, Label } from "flowbite-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const AddOrganizationModal = ({ isOpen, onClose }) => {
  const token = localStorage.getItem("token");

  // ✅ Validation Schema using Yup
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(8, "Name must be at least 8 characters")
      .required("Organization Name is required"),

    industry: Yup.string()
      .min(8, "Industry must be at least 8 characters")
      .required("Industry Type is required"),

    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),

    phone: Yup.string()
      .matches(/^\d{10,15}$/, "Phone number must be 10-15 digits")
      .required("Phone number is required"),

    startDate: Yup.date()
      .required("Start Date is required"),

    address: Yup.string()
      .min(8, "Address must be at least 8 characters")
      .required("Address is required"),

    website: Yup.string()
      
      .required("Website URL is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/organization/create-organization",
        {
          name: values.name,
          type: values.industry,
          email: values.email,
          phone: values.phone,
          startDate: values.startDate,
          address: values.address,
          webURL: values.website,
        },
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Organization created successfully!", {
          position: "top-right",
          autoClose: 1500,
        });

        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      } else {
        toast.error("Failed to create organization: " + response.data.message);
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("An error occurred while creating the organization.");
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
        className="bg-gray-100"
      >
        <Modal.Header />
        <Modal.Body>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Add Organization
          </h3>

          <Formik
            initialValues={{
              name: "",
              industry: "",
              email: "",
              phone: "",
              startDate: "",
              address: "",
              website: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, isValid, dirty }) => (
              <Form className="grid grid-cols-2 gap-4">
                
                {/* Name */}
                <div>
                  <Label htmlFor="name" value="Name" />
                  <Field as={TextInput} id="name" name="name" placeholder="Enter organization name" />
                  <ErrorMessage name="name" component="p" className="text-red-500 text-sm" />
                </div>

                {/* Industry */}
                <div>
                  <Label htmlFor="industry" value="Type of Industry" />
                  <Field as={TextInput} id="industry" name="industry" placeholder="Industry type" />
                  <ErrorMessage name="industry" component="p" className="text-red-500 text-sm" />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" value="Email Address" />
                  <Field as={TextInput} id="email" name="email" type="email" placeholder="Email address" />
                  <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" value="Phone" />
                  <Field as={TextInput} id="phone" name="phone" placeholder="Phone number" />
                  <ErrorMessage name="phone" component="p" className="text-red-500 text-sm" />
                </div>

                {/* Start Date */}
                <div>
                  <Label htmlFor="startDate" value="Start Date" />
                  <Field as={TextInput} id="startDate" name="startDate" type="date" />
                  <ErrorMessage name="startDate" component="p" className="text-red-500 text-sm" />
                </div>

                {/* Address */}
                <div>
                  <Label htmlFor="address" value="Address" />
                  <Field as={TextInput} id="address" name="address" placeholder="Organization address" />
                  <ErrorMessage name="address" component="p" className="text-red-500 text-sm" />
                </div>

                {/* Website */}
                <div>
                  <Label htmlFor="website" value="Website URL" />
                  <Field as={TextInput} id="website" name="website" placeholder="Website URL" />
                  <ErrorMessage name="website" component="p" className="text-red-500 text-sm" />
                </div>

                {/* Buttons */}
                <div className="flex justify-end mt-6 space-x-3 col-span-2">
                  <Button color="gray" onClick={onClose} type="button">
                    Cancel
                  </Button>
                  <Button color="blue" type="submit" >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default AddOrganizationModal;
