import React, { useState } from "react";
import Department from "./Team/Department";
import Team from "./Team/Team";

function Evaluation() {
  const [activeTab, setActiveTab] = useState("Team");

  return (
    <div className="flex-col bg-white rounded-lg p-2 mx-2">
      <div className="flex justify-between items-center">
        <h3 className="text-xl m-2 font-bold text-[#000000] dark:text-white">Employee</h3>

        {/* <div className="flex items-center border border-gray-200 dark:border-gray-700 m-2 p-3 rounded-lg  sm:w-auto">
          <ul className="flex flex-col sm:flex-row space-x-0 sm:space-x-4 text-sm font-medium text-gray-500 dark:text-gray-400 md:me-4 mb-4 sm:mb-0">
            <li>
              <button
                className={`btn px-4 py-2 sm:px-4 sm:py-3 rounded-lg w-full sm:w-auto text-center text-md font-semibold dark:bg-gray-800 text-sm sm:text-md dark:hover:bg-gray-700 dark:text-white ${
                  activeTab === "Team" ? "bg-blue-700 text-white" : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("Team")}
              >
                Team
              </button>
            </li>
            <li>
              <button
                className={`btn px-4 py-2 sm:px-4 sm:py-3 rounded-lg w-full sm:w-auto text-center text-md font-semibold dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white ${
                  activeTab === "Department" ? "bg-blue-700 text-white" : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("Department")}
              >
                Department
              </button>
            </li>
          </ul>
        </div> */}
      </div>
      <div>
        {activeTab === "Team" ? (
        <Department />
        ) : (
          <Department />
        )}
      </div>
    </div>
  );
}

export default Evaluation;
