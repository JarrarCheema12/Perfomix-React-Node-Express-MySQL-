import React, { useState, useEffect } from "react";
import axios from "axios";
import MuiTable from "../../mui/TableMuiCustom";
import { Chip } from "@mui/material";
import { Checkbox } from "flowbite-react";
import LineManagerEvaluationModal from "../../Modal/LineManagerEvaluationModal";

const Department = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]); 
  const [employees, setEmployees] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Modal state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const rowsPerPage = 10;

  // Retrieve token from localStorage
  const token = localStorage.getItem("token");

  // Column Headers
  const th = {
    id: "#ID",
    name: "Name",
    department: "Department",
    designation: "Designation",
    status: "Status",
    action: "Action",
  };
  const handleEvaluateClick = (id) => {
    setSelectedEmployeeId(id);
    setIsOpen(true);
  };

  // Fetch employees data from API
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/lm/get-employees", {
          headers: {
            Authorization: `${token}`,
          },
        });

        if (response.data.success) {
          const mappedData = response.data.employees.map((emp) => ({
            id: emp.user_id,
            name: emp.full_name,
            department: emp.department.department_name,
            designation: emp.designation,
            status: emp.evaluation_status,
          }));

          setEmployees(mappedData);
        } else {
          console.error("Failed to fetch employees:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEmployees();
    } else {
      console.error("Token is missing.");
    }
  }, [token]);

  const totalPages = Math.ceil(employees.length / rowsPerPage);

  // Handle Select All Checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(employees.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Handle individual row checkbox selection
  const handleSelectRow = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  // Handle Modal Open and Close
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const customFields = [
    {
      name: "status",
      data: (value) => (
        <Chip
          label={value}
          sx={{
            backgroundColor: value === "Completed" ? "#D4F8E8" : "#FFF3CD",
            color: value === "Completed" ? "#0F5132" : "#664D03",
            fontWeight: 500,
            fontSize: "16px",
            padding: "8px 12px",
          }}
        />
      ),
    },
    {
      name: "action",
      data: (_, row) => (
        <div
          className="text-center justify-center p-3 bg-white rounded-md shadow-md cursor-pointer"
          onClick={() => handleEvaluateClick(row.id)}
        >
          <p className="text-gray-900 dark:text-white font-semibold">Evaluate</p>
        </div>
      ),
    },
    
    {
      name: "id",
      data: (value) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Checkbox
            checked={selectedRows.includes(value)}
            onChange={() => handleSelectRow(value)}
          />
          <strong style={{ marginLeft: "8px", fontSize: "16px" }}>{value}</strong>
        </div>
      ),
    },
  ];

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <MuiTable
          th={{
            ...th,
            id: (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  onChange={handleSelectAll}
                  checked={selectedRows.length === employees.length}
                />
                <span style={{ marginLeft: "8px" }}>#ID</span>
              </div>
            ),
          }}
          td={employees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)}
          customFields={customFields}
          styleTableContainer={{ boxShadow: "none", borderRadius: "10px" }}
          styleTableThead={{ backgroundColor: "#F8F9FA" }}
          styleTableTh={{ fontWeight: "bold", color: "#333", fontSize: "16px" }}
          styleTableTbody={{ backgroundColor: "#FFFFFF" }}
          cellStyles={{
            name: { fontWeight: "500", color: "#555", fontSize: "16px" },
            department: { fontSize: "16px", color: "#444" },
            designation: { fontSize: "16px", color: "#444" },
            action: { fontSize: "16px", color: "#444" },
          }}
          rowStyles={{ backgroundColor: "#F8F8F8", fontSize: "16px", color: "#333" }}
          headerRounded={true}
          rowRounded={true}
        />
      )}

      <div className="flex justify-between items-center mt-4">
        <p className="text-gray-900 dark:text-white font-semibold">
          Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, employees.length)} of {employees.length}
        </p>
        <nav aria-label="Page navigation example">
          <ul className="inline-flex -space-x-px text-sm">
            <li>
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className="px-3 h-8 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i}>
                <button onClick={() => setCurrentPage(i + 1)} className={`px-3 h-8 border ${currentPage === i + 1 ? "bg-blue-700 text-white" : "bg-white text-gray-500"}`}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li>
              <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className="px-3 h-8 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <LineManagerEvaluationModal isOpen={isOpen} onClose={closeModal} employeeId={selectedEmployeeId} />
    </div>
  );
};

export default Department;
