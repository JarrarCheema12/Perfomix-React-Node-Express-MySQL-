import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal } from "flowbite-react";
import { toast } from "react-toastify";

const SurveyResponsePopup = ({ isOpen, onClose, surveyId, userId }) => {
  const [responses, setResponses] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen) {
      fetchSurveyResponse();
    }
  }, [isOpen]);

  const fetchSurveyResponse = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/survey/get-survey-response/${surveyId}/${userId}`, {
        headers: { Authorization: `${token}` },
      });

      if (response.data) {
        setResponses(response.data);
      } else {
        toast.error("Failed to fetch survey responses.");
      }
    } catch (error) {
      toast.error("Error fetching responses!");
      console.error("API Error:", error);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} className="bg-gray-100">
      <Modal.Header>Survey Response</Modal.Header>
      <Modal.Body>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {responses ? (
            <div>
              <h2 className="text-xl font-semibold">{responses.survey_title}</h2>
              <p className="text-gray-600">{responses.survey_description}</p>
              <p className="mt-2 font-medium">
                Respondent: {responses.full_name} ({responses.email})
              </p>

              <div className="mt-4 space-y-4">
                {responses.responses.map((response, index) => (
                  <div key={index} className="p-4 border rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium">{response.question_text}</h3>
                    <p className="text-gray-700">
                      <span className="font-semibold">Answer: </span>
                      {response.answer_text ? response.answer_text : response.option_text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>Loading responses...</p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default SurveyResponsePopup;
