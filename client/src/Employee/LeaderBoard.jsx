import React, { useEffect, useState } from "react";
import axios from "axios";
import PaginatedTable from "../Flowbite/PaginatedTable";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function LeaderBoard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get("http://localhost:8080/staff/view-staff-leaderboard", {
          headers: {
            Authorization: `${token}`, // Replace with your token
          },
        });

        const leaderboard = response.data.department.leaderboard.map((item) => ({
          name: item.full_name,
          email: item.email,
          designation: item.designation,
          score: `${item.performance_score}%`,
        }));

        setLeaderboardData(leaderboard);
        console.log("Leaderboard Data:", leaderboard);
        
        // toast.success("Leaderboard data loaded successfully!");
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        toast.error("Failed to load leaderboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const columns = [
    { header: "Name", key: "name" },
    { header: "Email", key: "email" },
    { header: "Designation", key: "designation" },
    { header: "Performance Score", key: "score" },
  ];

  return (
    <div className="m-4 h-full bg-gray-200 shadow-lg rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4">Performance Leaderboard</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <PaginatedTable data={leaderboardData} columns={columns} row={10} />
      )}

      {/* Toastify Container */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="colored"
      />
    </div>
  );
}

export default LeaderBoard;
