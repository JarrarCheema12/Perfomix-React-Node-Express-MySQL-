import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useParams, useNavigate } from "react-router-dom";
import SurveyResponsePopup from "../Modal/SurveyResponsePopup";

const DetailsStaffFeedback = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/survey/get-admin-survey/${id}`, {
                    headers: { Authorization: `${token}` },
                });
                if (response.data.success) {
                    setSurvey(response.data);
                }
            } catch (error) {
                console.error("Error fetching survey details:", error);
            }
        };
        fetchSurvey();
    }, [id, token]);

    if (!survey) {
        return <p className="m-6 p-6">Loading survey details...</p>;
    }

    return (
        <div className="m-6 p-6 bg-white shadow-lg rounded-lg">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
            >
                <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
                Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900 mb-4">{survey.survey.title}</h1>

            <h2 className="text-lg font-medium text-gray-700 mb-2">Survey Description</h2>
            <p className="text-gray-600 leading-relaxed">{survey.survey.description}</p>

            <div className="mt-6 border-t pt-4">
                <p className="text-gray-700"><span className="font-bold text-gray-900">Created At:</span> {new Date(survey.survey.created_at).toLocaleDateString()}</p>
                <p className="text-gray-700"><span className="font-bold text-gray-900">Total Employees:</span> {survey.total_employees}</p>
                <p className="text-gray-700"><span className="font-bold text-gray-900">Submitted:</span> {survey.submitted_count}</p>
                <p className="text-gray-700"><span className="font-bold text-gray-900">Not Submitted:</span> {survey.not_submitted_count}</p>
            </div>

            {/* Submitted Employees List with "View Response" button */}
            <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-700 mb-2">Submitted Employees</h2>
                {survey.submitted_employees.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-600">
                        {survey.submitted_employees.map((employee) => (
                            <li key={employee.user_id} className="flex justify-between items-center py-2">
                                <div>
                                    <span className="font-bold">{employee.full_name}</span> - {employee.designation} ({employee.email})
                                </div>
                                <button
                                    className="ml-4 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    onClick={() => setSelectedUser(employee.user_id)}
                                >
                                    View Response
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">No employees have submitted yet.</p>
                )}
            </div>

            {/* Survey Response Popup */}
            <SurveyResponsePopup
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                surveyId={id}
                userId={selectedUser}
            />
        </div>
    );
};

export default DetailsStaffFeedback;
