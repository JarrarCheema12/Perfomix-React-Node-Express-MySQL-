import React, { useState } from "react";
import MuiTable from "../../mui/TableMuiCustom";
import { Button, Chip } from "@mui/material";
import { Checkbox } from "flowbite-react";

const Team = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]); // State to keep track of selected rows
  const rowsPerPage = 10;

  const th = {
    id: "#ID",
    name: "Name",
    department: "Department",
    designation: "Designation",
    status: "Status",
    action: "Action",
  };

  const td = [
    { id: "001", name: "Aaqib Aizaz", department: "Design", designation: "Sr. UI/UX Designer", status: "Completed" },
    { id: "002", name: "Jarrar Cheema", department: "Development", designation: "Sr. Backend Developer", status: "Pending" },
    { id: "003", name: "Aiza Haleem", department: "Design", designation: "UI/UX Designer", status: "Completed" },
    { id: "004", name: "Khadija Asif", department: "Design", designation: "UI/UX Designer", status: "Pending" },
    { id: "005", name: "M. Waseem", department: "Project Management", designation: "Project Manager", status: "Completed" },
    { id: "006", name: "Awais Ahmed", department: "Business Analyst", designation: "B.A", status: "Pending" },
    { id: "007", name: "Nasir Ali", department: "Head of Department", designation: "CEO", status: "Completed" },
  ];

  const totalPages = Math.ceil(td.length / rowsPerPage);

  // Handle Select All Checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(td.map((row) => row.id));
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
      data: () => (
        <div className="text-center font-semibold text-sm font-medium text-gray-500 dark:text-gray-400 p-2 bg-white rounded-md shadow-md">
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
      <MuiTable
        th={{
          ...th,
          id: (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                onChange={handleSelectAll}
                checked={selectedRows.length === td.length}
              />
              <span style={{ marginLeft: "8px" }}>#ID</span>
            </div>
          ),
        }}
        td={td.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)}
        customFields={customFields}
        styleTableContainer={{ boxShadow: "none", borderRadius: "10px" }}
        styleTableThead={{ backgroundColor: "#F8F9FA" }}
        styleTableTh={{ fontWeight: "bold", color: "#333", fontSize: "16px" }}
        styleTableTbody={{ backgroundColor: "#FFFFFF" }}
        cellStyles={{ name: { fontWeight: "500", color: "#555", fontSize: "16px" }, department: { fontSize: "16px", color: "#444" }, designation: { fontSize: "16px", color: "#444" } }}
        rowStyles={{ backgroundColor: "#F8F8F8", fontSize: "16px", color: "#333" }}
        headerRounded={true}
        rowRounded={true}
      />

      <div className="flex justify-between items-center mt-4">
        <p className="text-gray-900 dark:text-white font-semibold">
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

export default Team;
