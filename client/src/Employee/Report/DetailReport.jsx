import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "flowbite/dist/flowbite.css";
import { Label, TextInput } from "flowbite-react";
import img from "../../assets/Image wrap.png";

const DetailReport = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const token = localStorage.getItem("token"); // Ensure token is fetched properly

  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/user/get-evaluations", {
          headers: { Authorization: `${token}` }, // Ensure correct token format
        });

        if (response.data.success) {
          setEvaluations(response.data.evaluations);
          setEmployeeData(response.data.evaluations[0]); // Assuming first record has employee details
          setFeedback(response.data.evaluations.map(e => e.feedback).filter(f => f)); // Store as an array
          toast.success("Evaluation data fetched successfully!");
        } else {
          toast.warn("No evaluation data available.");
        }
      } catch (error) {
        toast.error("Error fetching evaluation data.");
        console.error("Error fetching evaluation data:", error);
      }
    };

    fetchEvaluationData();
  }, []);

  return (
    <div className="flex-col m-4">
      {/* Personal Info Section */}
      <div className="flex mt-16 justify-between">
        <div className="m-3 w-1/3">
          <h3 className="text-xl font-semibold">Personal Info</h3>
          <p className="text-sm text-gray-500">Employee details based on evaluations.</p>
        </div>
        <div className="w-2/3 bg-white rounded-lg p-5 shadow-lg">
          <div className="flex w-full items-center justify-start m-3">
            <div className="flex flex-col items-center text-center">
              <img
                src={img}
                alt="Profile"
                className="w-16 h-16 rounded-full border-4 border-white shadow-md"
              />
              <h4 className="text-md font-semibold text-gray-800 mt-2">
                {employeeData?.evaluated_by_name || "Loading..."}
              </h4>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="metric" value="Metric Name" />
              <TextInput id="metric" type="text" value={employeeData?.metric_name || ""} readOnly />
            </div>
            <div>
              <Label htmlFor="parameter" value="Parameter Name" />
              <TextInput id="parameter" type="text" value={employeeData?.parameter_name || ""} readOnly />
            </div>
            <div>
              <Label htmlFor="marks" value="Marks Obtained" />
              <TextInput id="marks" type="text" value={employeeData?.marks_obtained || ""} readOnly />
            </div>
            <div>
              <Label htmlFor="weightage" value="Total Weightage" />
              <TextInput id="weightage" type="text" value={employeeData?.total_weightage || ""} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation Parameters Section */}
      <div className="flex w-full mt-16 justify-between">
        <div className="m-3 w-1/3">
          <h3 className="text-lg font-semibold">Evaluation Parameters</h3>
          <p className="text-sm text-gray-500">Performance evaluation details.</p>
        </div>
        <div className="mb-6 w-2/3">
          <div className="w-full bg-white p-6 rounded-lg shadow-lg grid grid-cols-1 gap-4 mt-4">
            {evaluations.map((evalItem, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <Label htmlFor={`metric-${index}`} value={evalItem.metric_name} />
                <div className="flex space-x-4">
                  <TextInput className="w-full" type="text" value={evalItem.marks_obtained} readOnly />
                  <TextInput className="w-full" type="text" value={evalItem.total_weightage} readOnly />
                </div>
                <span className="text-xs text-gray-500">Weightage: {evalItem.total_weightage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="flex w-full mt-16 justify-between">
        <div className="m-3 w-1/3">
          <h3 className="text-lg font-semibold">Feedback</h3>
          <p className="text-sm text-gray-500">Overall employee performance summary.</p>
        </div>
        <div className="w-2/3 bg-white rounded-lg p-5 shadow-lg">
          <h3 className="text-lg font-semibold">Areas for Improvement</h3>

          {feedback.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-500">
              {feedback.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No feedback provided.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailReport;
