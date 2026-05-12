import React, { useState, useEffect } from "react";
import axios from "axios";
import MuiTable from "../mui/TableMuiCustom";
import { Checkbox } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const rowsPerPage = 10;

  const th = {
    id: "ID",
    department: "Department",
    employees: "No. of Employees",
    // performance: "Performance Matrix",
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);

        // Get token from localStorage
        const token = localStorage.getItem("token");

        // If token is not available, show error
        if (!token) {
          toast.error("Token not found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8080/lm/get-lm-departments", {
          headers: {
            Authorization: `${token}`,
          },
        });

        if (response.data.success) {
          const fetchedData = response.data.data.map((dept) => ({
            id: dept.department_id,
            department: dept.department_name,
            employees: dept.employee_count,
            performance: "N/A", // Placeholder, adjust as needed
          }));
          setDepartments(fetchedData);
          // toast.success("Departments loaded successfully!");
        } else {
          setError("Failed to load departments.");
          toast.error("Failed to load departments.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data.");
        toast.error("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const totalPages = Math.ceil(departments.length / rowsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(departments.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg m-2">
      <ToastContainer />
<div className="flex justify-between items-start  m-4">
  <p className="text-gray-900 font-bold dark:text-white text-2xl">Total Departments: {departments.length}</p>
</div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <MuiTable
          th={{
            ...th,
            id: (
              <div className="flex items-center">
                <Checkbox
                  id="selectAll"
                  onChange={handleSelectAll}
                  checked={selectedRows.length === departments.length}
                />
                <span className="ml-2">ID</span>
              </div>
            ),
          }}
          td={departments
            .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
            .map((row) => ({
              ...row,
              id: (
                <div className="flex items-center">
                  <Checkbox
                    id={row.id}
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                  />
                  <span className="ml-2">{row.id}</span>
                </div>
              ),
            }))}
          styleTableContainer={{ boxShadow: "none", borderRadius: "10px" }}
          styleTableThead={{ backgroundColor: "#F8F9FA" }}
          styleTableTh={{ fontWeight: "bold", color: "#333", fontSize: "16px" }}
          styleTableTbody={{ backgroundColor: "#FFFFFF" }}
          cellStyles={{
            department: { fontWeight: "500", color: "#555", fontSize: "18px" },
            employees: { fontSize: "19px", color: "#444" },
            performance: { fontSize: "18px", color: "#444" },
            id: { fontSize: "18px", color: "#444" },
          }}
          rowStyles={{ backgroundColor: "#FFFFFF", fontSize: "24px", color: "#333" }}
          headerRounded={true}
          rowRounded={true}
        />
      )}

      <div className="flex justify-between items-center mt-4">
        <p className="text-gray-900 dark:text-gray-400 font-semibold">
          Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, departments.length)} of {departments.length}
        </p>
        <nav aria-label="Page navigation example">
          <ul className="inline-flex -space-x-px text-sm">
            <li>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 h-8 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i}>
                <button
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 h-8 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 ${
                    currentPage === i + 1 ? "bg-blue-700 text-white" : "bg-white text-gray-500"
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 h-8 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Department;
