import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Label, Select, TextInput } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ShowLineMangerDepartment = ({ isOpen, onClose, id }) => {
  const [lineManagers, setLineManagers] = useState([]);
  const [selectedLM, setSelectedLM] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const organizationId = localStorage.getItem("selectedOrganizationId");
  const organization_id = organizationId;

  useEffect(() => {
    const fetchLineManagers = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `http://localhost:8080/user/get-all-LMs/${organization_id}`,
          {
            headers: { Authorization: `${token}` },
          }
        );

        if (response.data.success) {
          setLineManagers(response.data.Line_Managers);
        } else {
          toast.error("Failed to fetch data. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching Line Managers:", error);
        toast.error("Failed to fetch data. Please try again.");
      }
    };

    if (isOpen) {
      fetchLineManagers();
    }
  }, [isOpen, id]);

  // Open Assign Metric Modal
  const openAssignModal = (lm) => {
    setSelectedLM(lm);
    setAssignModalOpen(true);
  };

  return (
    <>
      <ToastContainer />
      <Modal show={isOpen} onClose={onClose} popup={true} size="lg" className="bg-gray-100">
        <Modal.Header className="text-center">Line Managers</Modal.Header>
        <Modal.Body>
          {lineManagers.length > 0 ? (
            <div className="space-y-4">
              {lineManagers.map((lm) => (
                <div
                  key={lm.user_id}
                  className="border rounded-lg p-4 shadow-md flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {lm.full_name} ({lm.user_name})
                    </h3>
                    <p className="text-gray-600">{lm.designation}</p>

                    {/* Display Departments */}
                    <p className="text-gray-800 font-semibold mt-2">
                      Departments:
                    </p>
                    {lm.departments && lm.departments.length > 0 ? (
                      <ul className="list-disc list-inside text-gray-600">
                        {lm.departments.map((dept, index) => (
                          <li key={index}>{dept}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No departments assigned.</p>
                    )}
                  </div>

                  <Button color="blue" onClick={() => openAssignModal(lm)}>
                    Assign Metric
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No Line Managers available.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Assign Metric Modal */}
      <Modal show={assignModalOpen} onClose={() => setAssignModalOpen(false)} popup={true} size="md" className="bg-gray-100">
        <Modal.Header className="text-center">Assign Metric</Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              metric_id: id || "",
              department_id: "",
            }}
            validationSchema={Yup.object({
              metric_id: Yup.string().required("Metric ID is required"),
              department_id: Yup.string().required("Please select a department"),
            })}
            onSubmit={async (values, { setSubmitting }) => {
              console.log("Submitting Form with values:", values);

              const token = localStorage.getItem("token");
              if (!token || !selectedLM) {
                toast.error("Required data missing.");
                setSubmitting(false);
                return;
              }

              try {
                const response = await axios.post(
                  `http://localhost:8080/performance/assign-metric`,
                  {
                    metric_id: values.metric_id,
                    line_manager_id: selectedLM.user_id,
                    department_id: values.department_id,
                  },
                  { headers: { Authorization: `${token}` } }
                );

                if (response.data.success) {
                  toast.success("Metric assigned successfully!");
                  setAssignModalOpen(false);
                } else {
                  toast.error("Failed to assign metric. Try again.");
                }
              } catch (error) {
                console.error("Error assigning metric:", error);
                toast.error("Error assigning metric. Please try again.");
              }

              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                {/* Metric ID Input */}
                <div>
                  <Label htmlFor="metric_id" value="Metric ID" />
                  <Field
                    as={TextInput}
                    id="metric_id"
                    name="metric_id"
                    placeholder="Enter Metric ID"
                    required
                  />
                  <ErrorMessage name="metric_id" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Department Select Dropdown */}
                <div>
                  <Label htmlFor="department_id" value="Department" />
                  <Field as={Select} id="department_id" name="department_id" required>
                    <option value="">Select Department</option>
                    {selectedLM &&
                      selectedLM.dept_ids.map((deptId, index) => (
                        <option key={index} value={deptId}>
                          {selectedLM.departments[index]}
                        </option>
                      ))}
                  </Field>
                  <ErrorMessage name="department_id" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Buttons */}
                <div className="flex justify-end mt-6 space-x-3">
                  <Button color="gray" onClick={() => setAssignModalOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" color="blue" disabled={isSubmitting}>
                    {isSubmitting ? "Assigning..." : "Assign Metric"}
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

export default ShowLineMangerDepartment;
