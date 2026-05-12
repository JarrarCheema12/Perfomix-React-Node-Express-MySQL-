import React, { useEffect } from "react";
import { Modal, Button, TextInput, Label } from "flowbite-react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

const EditOrganizationModal = ({ isOpen, onClose, organization }) => {
  const token = localStorage.getItem("token");

  // Formik Setup
  const formik = useFormik({
    initialValues: {
      organization_name: organization?.name || "",
      type: organization?.industry || "",
      email: organization?.email || "",
      phone: organization?.phone || "",
      start_date: organization?.startDate || "",
      address: organization?.address || "",
      webURL: organization?.website || "",
    },
    validationSchema: Yup.object({
      organization_name: Yup.string()
        .trim()
        .min(3, "Organization name must be at least 3 characters")
        .max(50, "Organization name must be less than 50 characters")
        .required("Organization name is required"),
      type: Yup.string()
        .trim()
        .required("Industry type is required"),
      email: Yup.string()
        .trim()
        .email("Invalid email address")
        .required("Email is required"),
      phone: Yup.string()
        .matches(/^\d{10,15}$/, "Phone number must be between 10-15 digits")
        .required("Phone number is required"),
      start_date: Yup.date().required("Start date is required"),
      address: Yup.string().trim().required("Address is required"),
      webURL: Yup.string()
        .trim()
        .url("Invalid URL format")
        .required("Website URL is required"),
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.put(
          `http://localhost:8080/organization/update-organization/${organization.id}`,
          values,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (response.data.success) {
          alert("Organization updated successfully!");
          onClose();
        } else {
          alert("Failed to update organization.");
        }
      } catch (error) {
        console.error("Error updating organization:", error);
        alert("An error occurred while updating the organization.");
      }
    },
  });

  useEffect(() => {
    if (organization) {
      formik.setValues({
        organization_name: organization.name || "",
        type: organization.industry || "",
        email: organization.email || "",
        phone: organization.phone || "",
        start_date: organization.startDate || "",
        address: organization.address || "",
        webURL: organization.website || "",
      });
    }
  }, [organization]);

  return (
    <Modal
      show={isOpen}
      size="xl"
      onClose={onClose}
      popup
      className="bg-gray-100"
    >
      <Modal.Header />
      <Modal.Body>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Edit Organization
        </h3>
        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organization_name" value="Organization Name" />
              <TextInput
                id="organization_name"
                name="organization_name"
                value={formik.values.organization_name}
                placeholder="Enter organization name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.organization_name && formik.errors.organization_name && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.organization_name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="type" value="Type of Industry" />
              <TextInput
                id="type"
                name="type"
                value={formik.values.type}
                placeholder="Enter industry type"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.type && formik.errors.type && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.type}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" value="Email Address" />
              <TextInput
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                placeholder="Enter email address"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone" value="Phone" />
              <TextInput
                id="phone"
                name="phone"
                value={formik.values.phone}
                placeholder="Enter phone number"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.phone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="start_date" value="Start Date" />
              <TextInput
                id="start_date"
                name="start_date"
                type="date"
                value={formik.values.start_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.start_date && formik.errors.start_date && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.start_date}</p>
              )}
            </div>
            <div>
              <Label htmlFor="address" value="Address" />
              <TextInput
                id="address"
                name="address"
                value={formik.values.address}
                placeholder="Enter address"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.address && formik.errors.address && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.address}</p>
              )}
            </div>
            <div>
              <Label htmlFor="webURL" value="URL (Website)" />
              <TextInput
                id="webURL"
                name="webURL"
                value={formik.values.webURL}
                placeholder="Enter website URL"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.webURL && formik.errors.webURL && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.webURL}</p>
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

export default EditOrganizationModal;
