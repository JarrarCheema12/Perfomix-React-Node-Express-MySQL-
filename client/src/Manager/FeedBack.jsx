import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FeedBack() {
  const [surveys, setSurveys] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await axios.get("http://localhost:8080/survey/get-surveys", {
        headers: {
          Authorization: `${token}`, // Ensure the token is prefixed correctly
        },
      });

      if (response.data.success) {
        setSurveys(response.data.surveys);
        // toast.success("Surveys fetched successfully!");
      } else {
        toast.error(response.data.message || "Failed to fetch surveys");
      }
    } catch (error) {
      toast.error("Error fetching surveys!");
      console.error("API Error:", error);
    }
  };

  const handleSurveyClick = (surveyId) => {
    navigate(`/manger/fill-survey/${surveyId}`);
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h2 className="text-xl font-bold mb-4">Surveys</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {surveys.map((survey) => (
          <div
            key={survey.survey_id}
            className="border p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
            onClick={() => handleSurveyClick(survey.survey_id)}
          >
            <h3 className="text-lg font-semibold">{survey.title}</h3>
            <p className="text-sm text-gray-600">{survey.description}</p>
            <p className="text-xs text-gray-500 mt-2">Created by: {survey.created_by_name}</p>
            <p className="text-xs text-gray-500">Organization: {survey.organization_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
