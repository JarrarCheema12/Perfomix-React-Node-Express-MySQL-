import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextInput, Textarea, Button, Card } from "flowbite-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function StaffFeedback() {
  const [isCreating, setIsCreating] = useState(false);
  const [survey, setSurvey] = useState({
    title: "",
    description: "",
    questions: [],
  });
  const [surveys, setSurveys] = useState([]);
  const organization_id = localStorage.getItem("selectedOrganizationId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/survey/get-admin-surveys/${organization_id}`, {
        headers: { Authorization: `${token}` },
      });
      if (response.data.success) {
        setSurveys(response.data.surveys);
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  };

  const addQuestion = () => {
    setSurvey({
      ...survey,
      questions: [
        ...survey.questions,
        { question_text: "", question_type: "multiple_choice", options: ["", "", ""] },
      ],
    });
  };

  const updateQuestion = (index, value) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[index].question_text = value;
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setSurvey({ ...survey, questions: updatedQuestions });
  };
console.log('or');

  const createSurvey = async () => {
    console.log(survey);
    
    try {
      const response = await axios.post(
        `http://localhost:8080/survey/create-survey/${organization_id}`,
        survey,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      if (response.status === 201) {
        toast.success("Survey Created Successfully!");
        setIsCreating(false);
        setSurvey({ title: "", description: "", questions: [] });
        fetchSurveys();
      } else {
        alert("Failed to create survey");
      }
    } catch (error) {

      console.error("Error creating survey:", error);
    }
  };

  const handleSurveyClick = (surveyId) => {
    navigate(`/admin/stafffeedback/${surveyId}`);
  };

  return (
    <>   <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
     
    {/* Create Survey Section */}
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Survey</h2>
      {!isCreating ? (
        <Button onClick={() => setIsCreating(true)} color="blue" className="w-full">
          Add Survey
        </Button>
      ) : (
        <div>
          <TextInput
            type="text"
            placeholder="Survey Title"
            className="mb-2"
            value={survey.title}
            onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
          />
          <Textarea
            placeholder="Survey Description"
            className="mb-2"
            value={survey.description}
            onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
          />
          <Button onClick={addQuestion} color="green" className="mb-4 w-full">
            Add Question
          </Button>
          {survey.questions.map((q, qIndex) => (
            <div key={qIndex} className="mb-4 p-3 rounded bg-gray-100">
              <TextInput
                type="text"
                placeholder="Question text"
                className="mb-2"
                value={q.question_text}
                onChange={(e) => updateQuestion(qIndex, e.target.value)}
              />
              <div className="flex flex-wrap gap-4">
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center space-x-2">
                    <p>{oIndex + 1}:</p>
                    <TextInput
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      className="w-32"
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button onClick={createSurvey} color="blue" className="w-full">
            Submit Survey
          </Button>
        </div>
      )}
    </div>

    {/* Survey Feedback Section */}
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Survey Feedback</h2>
      {surveys.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {surveys.map((survey) => (
            <Card key={survey.survey_id} className="cursor-pointer hover:shadow-lg" onClick={() => handleSurveyClick(survey.survey_id)}>
              <h3 className="text-lg font-semibold">{survey.survey_title}</h3>
              <p className="text-gray-600">Total Employees: {survey.total_employees}</p>
              <p className="text-gray-600">Submitted: {survey.submitted_count}</p>
              <p className="text-gray-600">Not Submitted: {survey.not_submitted_count}</p>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No surveys available.</p>
      )}
    </div>
  </div>
  <ToastContainer position="top-right" autoClose={3000} />
  </>
 
  );
}

export default StaffFeedback;
