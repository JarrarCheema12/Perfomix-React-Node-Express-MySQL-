import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "flowbite-react";
import { HiPlusCircle } from "react-icons/hi";
import AddEmployeeEvaluationModal from "./AddEmployeeEvaluationModal";

const LineManagerEvaluationModal = ({ isOpen, onClose, employeeId }) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMetricId, setSelectedMetricId] = useState(null);
  const [selectedParameterId, setSelectedParameterId] = useState(null);

  // Retrieve token from localStorage
  const token = localStorage.getItem("token");
  const user_id = employeeId;

  // Fetch metrics when modal is opened and employeeId is set
  useEffect(() => {
    const fetchMetrics = async () => {
      if (isOpen && employeeId) {
        setLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:8080/lm/get-employee-metrics/${user_id}`,
            {
              headers: {
                Authorization: `${token}`,
              },
            }
          );

          if (response.data.success) {
            setMetrics(response.data.pending_metrics);
          } else {
            console.error("Failed to fetch metrics:", response.data.message);
          }
        } catch (error) {
          console.error("Error fetching metrics:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMetrics();
  }, [isOpen, employeeId, token]);

  // Open Add Evaluation Modal
  const openAddModal = (metricId, parameterId) => {
    setSelectedMetricId(metricId);
    setSelectedParameterId(parameterId);
    setShowAddModal(true);
  };

  return (
    <>
      <Modal show={isOpen} onClose={onClose} size="lg" className=" bg-gray-100">
        <Modal.Header>Evaluate Employee</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-lg font-semibold">
              Evaluating Employee ID: {employeeId}
            </p>
            {loading ? (
              <p>Loading metrics...</p>
            ) : metrics.length > 0 ? (
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <div
                    key={metric.metric_id}
                    className="border rounded-md p-4 bg-gray-50 shadow-sm"
                  >
                    <h3 className="text-lg font-bold text-gray-800">
                      {metric.metric_name}
                    </h3>
                    <ul className="list-disc ml-5 mt-2">
                      {metric.pending_parameters.map((param) => (
                        <li
                          key={param.parameter_id}
                          className="text-gray-700 flex justify-between items-center"
                        >
                          {param.parameter_name}
                          <HiPlusCircle
                            className="text-blue-600 size-6 cursor-pointer hover:text-blue-800"
                            size={24}
                            onClick={() => openAddModal(metric.metric_id, param.parameter_id)}
                            title="Add Evaluation"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p>No pending metrics found.</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Employee Evaluation Modal */}
      <AddEmployeeEvaluationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        employeeId={employeeId}
        metricId={selectedMetricId}
        parameterId={selectedParameterId}
      />
    </>
  );
};

export default LineManagerEvaluationModal;
