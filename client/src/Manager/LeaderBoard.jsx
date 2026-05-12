import React, { useState, useEffect } from "react";
import axios from "axios";
import PaginatedTable from "../Flowbite/PaginatedTable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LeaderBoard() {
  const [activeTab, setActiveTab] = useState("All departments");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabs, setTabs] = useState(["All departments"]);

  const columns = [
    { header: "Name", key: "full_name" },
    { header: "Designation", key: "designation" },
    { header: "Performance Score", key: "performance_score" }
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:8080/lm/view-lm-leaderboard", {
          headers: {
            Authorization: `${token}`,
          },
        });

        if (response.data.success) {
          const fetchedData = response.data.data.flatMap((dept) =>
            dept.users.map((user) => ({
              full_name: user.full_name,
              designation: user.designation,
              performance_score: user.performance_score + "%",
              department: dept.department_name
            }))
          );

          setLeaderboardData(fetchedData);

          // Dynamically generate tabs from department names
          const departmentTabs = response.data.data.map((dept) => dept.department_name);
          setTabs(["All departments", ...new Set(departmentTabs)]);

          // toast.success("Leaderboard fetched successfully!");
        } else {
          setError("Failed to load leaderboard.");
          toast.error("Failed to load leaderboard.");
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setError("An error occurred while fetching data.");
        toast.error("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filteredData =
    activeTab === "All departments"
      ? leaderboardData
      : leaderboardData.filter((item) => item.department === activeTab);

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
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <PaginatedTable data={filteredData} columns={columns} row={10} />
      )}

      <ToastContainer />
    </div>
  );
}

export default LeaderBoard;
