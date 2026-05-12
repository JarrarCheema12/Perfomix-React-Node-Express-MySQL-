import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FillSurvey() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [survey_id, setSurvey_id] = useState([]);

  useEffect(() => {
    fetchSurveyDetails();
  }, []);
const token = localStorage.getItem("token");
  const fetchSurveyDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/survey/get-survey-details/${id}`, {
        headers: {
          Authorization: `${token}`, // Replace with actual token
        },
      });

      if (response.data.success) {
        setSurvey(response.data.survey);
        toast.success("Survey details loaded successfully!");
        console.log("Survey details:", response.data.survey.survey_id);
        setSurvey_id(response.data.survey.survey_id);
        
      } else {
        toast.error(response.data.message || "Failed to load survey details");
      }
    } catch (error) {
      toast.error("Error fetching survey details!");
      console.error("API Error:", error);
    }
  };

  const handleAnswerChange = (questionId, optionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { question_id: questionId, option_id: optionId, answer_text: text },
    }));
  };

  const handleSubmit = async () => {
    const allAnswered = survey?.questions.every((q) => answers[q.question_id]);
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized! Please login again.");
        return;
      }
  
      const response = await axios.post(
        `http://localhost:8080/survey/submit-survey/${survey_id}`, // Ensure correct survey_id
        { answers: Object.values(answers) },
        {
          headers: {
            Authorization: `${token}`, // Ensure correct token format
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data.success) {
        toast.success("Survey submitted successfully!");
        
        // ⏳ Wait for 2 seconds before navigating
        setTimeout(() => {
          navigate("/employee/feedback");
        }, 2000);
        
      } else {
        toast.error(response.data.message || "Failed to submit survey");
      }
    } catch (error) {
      toast.error("Error submitting survey!");
      console.error("API Error:", error);
    }
  };
  

  return (
    <div className="p-4">
      <ToastContainer  position="top-right" autoClose={3000}/>
      {survey ? (
        <>
          <h2 className="text-xl font-bold mb-4">{survey.title}</h2>
          <p className="text-gray-600 mb-6">{survey.description}</p>

          {survey.questions.map((question) => (
            <div key={question.question_id} className="mb-4 p-4 border rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{question.question_text}</h3>

              {question.question_type === "multiple_choice" ? (
                <div className="mt-2">
                  {question.options.map((option) => (
                    <label key={option.option_id} className="block p-2 border rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="radio"
                        name={`question-${question.question_id}`}
                        value={option.option_id}
                        onChange={() => handleAnswerChange(question.question_id, option.option_id, null)}
                        className="mr-2"
                      />
                      {option.option_text}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full p-2 mt-2 border rounded-lg"
                  placeholder="Your answer..."
                  onChange={(e) => handleAnswerChange(question.question_id, null, e.target.value)}
                />
              )}
            </div>
          ))}

          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={handleSubmit}
          >
            Submit Survey
          </button>
        </>
      ) : (
        <p>Loading survey details...</p>
      )}
    </div>
  );
}
