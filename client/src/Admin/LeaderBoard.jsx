import React, { useState, useEffect } from "react";
import axios from "axios";
import PaginatedTable from "../Flowbite/PaginatedTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LeaderBoard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeTab, setActiveTab] = useState("All departments");

  // Get organization ID and token from local storage
  const organization_id = localStorage.getItem("selectedOrganizationId");
  const token = localStorage.getItem("token");

  // Define columns for the table
  const columns = [
    { header: "Name", key: "name" },
    { header: "Designation", key: "designation" },
    { header: "Performance Score", key: "score" },
  ];

  // Fetch Leaderboard Data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/user/view-leaderboard/${organization_id}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        console.log("Leaderboard Data:", response.data);
        

        if (response.data.success) {
          const transformedData = response.data.data.flatMap((dept) =>
            dept.users.map((user) => ({
              name: user.full_name,
              designation: user.designation,
              score: user.performance_score,
              department: dept.department_name,
            }))
          );
          setLeaderboardData(transformedData);
          setFilteredData(transformedData);
          // toast.success("Leaderboard fetched successfully!");
        } else {
          toast.error("Failed to fetch leaderboard data.");
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        toast.error("An error occurred while fetching the data.");
      }
    };

    fetchLeaderboard();
  }, [organization_id, token]);

  // Tabs for filtering
  const tabs = ["All departments", ...new Set(leaderboardData.map((item) => item.department))];

  // Handle Tab Change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "All departments") {
      setFilteredData(leaderboardData);
    } else {
      setFilteredData(leaderboardData.filter((item) => item.department === tab));
    }
  };

  return (
    <div className="m-4 h-full bg-gray-200 shadow-lg rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4">Performance Leaderboard</h3>

      <div className="border-b border-gray-300 mb-6 mt-8 overflow-x-auto whitespace-nowrap">
        <div className="flex space-x-6 text-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`pb-2 ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : "text-gray-500 hover:text-gray-600"
              }`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <PaginatedTable data={filteredData} columns={columns} row={10} />

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default LeaderBoard;
