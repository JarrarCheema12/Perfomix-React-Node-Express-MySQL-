import React, { useState, useEffect } from "react";
import { HiSearch, HiX, HiTrash } from "react-icons/hi";
import { FaRegEye } from "react-icons/fa";
import PaginatedTable from "../Flowbite/PaginatedTable";
import AddEmployeeModal from "../Modal/AddEmployeeModal";
import ViewEvaluationModal from "../Modal/ViewEvaluationModal";
import axios from "axios";
import { toast } from "react-toastify";
import { IoFilter } from "react-icons/io5";
import { Menu, MenuItem, IconButton } from "@mui/material";

const Employees = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isDepartmentDropdownVisible, setIsDepartmentDropdownVisible] = useState(false);
  const [isEvaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Get unique departments for filtering
  const uniqueDepartments = [...new Set(employees.map((emp) => emp.departments))];

  // Fetch Employees from API
  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");
    const organization_id = localStorage.getItem("selectedOrganizationId");

    if (!token || !organization_id) {
      console.error("No token or organizationId found in localStorage.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/user/get-all-LMs/${organization_id}`,
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (response.data.success) {
        setEmployees(response.data.Line_Managers || []);
      } else {
        console.error("Failed to fetch employees:", response.data.message);
        toast.error("Failed to fetch employees!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Error fetching employees!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Fetch Departments from API
  const fetchDepartments = async () => {
    const token = localStorage.getItem("token");
    const organizationId = localStorage.getItem("selectedOrganizationId");

    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/department/get-departments/${organizationId}`,
        {
          headers: { Authorization: `${token}` },
        }
      );

      if (response.data.success) {
        setDepartments(response.data.departments || []);
      } else {
        console.error("Failed to fetch departments:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  // Filter employees based on search term and selected department
  const filteredEmployees = employees.filter((emp) =>
    (searchTerm === "" ||
      emp.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedDepartment === "" || emp.departments === selectedDepartment)
  );

  // Handle opening the View Evaluation Modal
  const handleViewEvaluation = (employee) => {
    console.log("Viewing evaluation for employee:", employee);
    
    setSelectedEmployee(employee);
    setShowEvaluation(true);
  };

  // Handle closing the View Evaluation Modal
  const closeViewEvaluation = () => {
    setSelectedEmployee(null);
    setShowEvaluation(false);
  };

  // Handle Employee Deletion
  const handleDeleteEmployee = async (emp) => {
    const employee_id=emp.user_id;
    console.log("Deleting employee with ID:", employee_id);
    
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `http://localhost:8080/user/delete-employee/${employee_id}`,
          {
            headers: { Authorization: `${token}` },
          }
        );

        if (response.data.success) {
          setEmployees(employees.filter((emp) => emp.id !== employee_id));
          toast.success("Employee deleted successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          toast.error("Failed to delete employee!", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        toast.error("Error deleting employee!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  // Handle filter icon click
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle department filter selection
  const handleDepartmentFilter = (department) => {
    setSelectedDepartment(department);
    handleMenuClose();
  };

  // Column definitions
  const columns = [
    { header: "Username", accessor: "user_name", key: "user_name" },
    { header: "Full Name", accessor: "full_name", key: "full_name" },
    { header: "Designation", accessor: "designation", key: "designation" },
    { header: "Department", accessor: "departments", key: "departments" },
    {
      header: "Evaluation",
      accessor: "evaluation",
      key: "evaluation",
    },
    { header: "Action", accessor: "actions", isAction: true, key: "actions" },
  ];

  // Filtered data with actions
  const filteredData = filteredEmployees.map((emp) => ({
    ...emp,
    evaluation: (
      <FaRegEye
        className="text-gray-500 size-6 cursor-pointer"
        onClick={() => handleViewEvaluation(emp)}
      />
    ),
    actions: (
      <div className="flex space-x-2">
        <HiTrash
          className="text-red-500 size-6 cursor-pointer"
          onClick={() => handleDeleteEmployee(emp)}
        />
      </div>
    ),
  }));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Employee List</h2>
        <div className="flex items-center space-x-2">
          <div className="relative w-72">
            <HiSearch className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {searchTerm && (
              <HiX
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>
          <div className="relative">
            <IconButton onClick={handleFilterClick}>
              <IoFilter size={24} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleDepartmentFilter("")}>All</MenuItem>
              {uniqueDepartments.map((department, index) => (
                <MenuItem key={index} onClick={() => handleDepartmentFilter(department)}>
                  {department}
                </MenuItem>
              ))}
            </Menu>
          </div>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={() => {
              setIsAddingEmployee(true);
              setIsDepartmentDropdownVisible(true);
            }}
          >
            + Add Employee
          </button>
        </div>
      </div>

      {isAddingEmployee && isDepartmentDropdownVisible && (
        <div className="mb-4">
          <label className="font-semibold">Select Department</label>
          <select
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setModalOpen(true); // Open the modal when a department is selected
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Select a department
            </option>
            {departments.map((dept) => (
              <option key={dept.dept_id} value={dept.dept_id}>
                {dept.department_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <PaginatedTable data={filteredData || []} columns={columns} row={10} />

      <AddEmployeeModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} selectedDepartment={selectedDepartment} />

      <ViewEvaluationModal isOpen={showEvaluation} onClose={closeViewEvaluation} employeeData={selectedEmployee} />
    </div>
  );
};

export default Employees;