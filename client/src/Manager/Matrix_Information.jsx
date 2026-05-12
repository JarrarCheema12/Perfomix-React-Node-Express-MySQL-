import React, { useState } from "react";
import MuiTable from "../mui/TableMuiCustom";
import { Checkbox } from "flowbite-react";  // Import Flowbite Checkbox
import { IoFilterSharp } from "react-icons/io5"; // Import Table icon from react-icons
import { Dropdown } from "flowbite-react"; // Import Flowbite Dropdown


const Matrix_Information = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);  // To track selected rows
  const rowsPerPage = 10;

  const th = {
    id: "ID",
    department: "Department",
    employees: "No. of Employees",
    performance: "Performance Matrix",
  };

  const td = [
    { id: "001", department: "Design", employees: "32", performance: "Accuracy and completeness of tasks" },
    { id: "002", department: "Development", employees: "46", performance: "Timeliness of task completion" },
    { id: "003", department: "IT", employees: "08", performance: "Proactivity in taking on new tasks" },
    { id: "004", department: "Management", employees: "06", performance: "Clarity and effectiveness of communication" },
    { id: "005", department: "Project Management", employees: "18", performance: "Application of feedback and knowledge" },
    { id: "006", department: "Business Analyst", employees: "23", performance: "Willingness to learn new skills" },
    { id: "007", department: "Head of Department", employees: "04", performance: "Collaboration with team members" },
  ];

  const totalPages = Math.ceil(td.length / rowsPerPage);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(td.map((row) => row.id));
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
    <div className="p-3 bg-white rounded-md m-2 ">
     <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
        
          <h3 className="text-xl font-semibold">Matrix Information</h3>
        </div>
        <div className="flex items-center gap-4 bg-gray-100 rounded px-4 py-2">  <IoFilterSharp className="text-blue-900 text-lg" />
        <Dropdown label="Matrix 1" inline={true} className="text-gray-500">
          <Dropdown.Item>Matrix 1</Dropdown.Item>
          <Dropdown.Item>Matrix 2</Dropdown.Item>
          <Dropdown.Item>Matrix 3</Dropdown.Item>
        </Dropdown>
        </div>
      </div>

      <MuiTable
        th={{
          ...th,
          id: (
            <div className="flex items-center">
              <Checkbox
                id="selectAll"
                onChange={handleSelectAll}
                checked={selectedRows.length === td.length}
              />
              <span className="ml-2">ID</span>
            </div>
          ),
        }}
        td={td.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((row) => ({
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
        rowStyles={{ backgroundColor: "#Ffffff", fontSize: "24px", color: "#333" }}
        headerRounded={true}
        rowRounded={true}
      />

      <div className="flex justify-between items-center mt-4">
        <p className="text-gray-900 dark:text-gray-400 font-semibold">
          Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, td.length)} of {td.length}
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

export default Matrix_Information;
