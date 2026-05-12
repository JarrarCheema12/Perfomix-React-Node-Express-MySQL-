import db from "../../config/db.js";
import jwt from 'jsonwebtoken';

export const getSingleSurveyDetails = async (req, res) => {
    try {
        const { survey_id } = req.params;

        // Validate survey_id
        if (!survey_id) {
            return res.status(400).send({ success: false, message: "Survey ID is required" });
        }

        // Authorization
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({ success: false, message: "Authorization token is required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Get Employee Details
        const getUserQuery = "SELECT user_id, role_id, created_by FROM users WHERE user_id = ? AND is_active = 1;";
        const user = await new Promise((resolve, reject) => {
            db.query(getUserQuery, [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!user) {
            return res.status(404).send({ success: false, message: "User not found or inactive" });
        }

        // Ensure User is an Employee
        if (user.role_id === 1) {
            return res.status(403).send({ success: false, message: "Admins cannot access this data" });
        }

        // Get Employee's Admin ID
        const adminId = user.created_by;
        if (!adminId) {
            return res.status(400).send({ success: false, message: "No admin found for this employee" });
        }

        // Check if the Survey is Created by Employee's Admin
        const getSurveyQuery = `
            SELECT s.survey_id, s.title, s.description, s.created_by AS created_by_id, u.full_name AS created_by_name, s.organization_id, o.organization_name, CONVERT_TZ(created_at, '+00:00', '+05:00') AS created_at
            FROM surveys s JOIN users u ON s.created_by = u.user_id 
            JOIN organizations o ON o.organization_id = s.organization_id
            WHERE s.survey_id = ? AND s.created_by = ?;
        `;

        const survey = await new Promise((resolve, reject) => {
            db.query(getSurveyQuery, [survey_id, adminId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!survey) {
            return res.status(403).send({ success: false, message: "Survey not accessible to this employee" });
        }

        // Fetch Survey Questions
        const getQuestionsQuery = `
            SELECT q.question_id, q.survey_id, q.question_text, q.question_type
            FROM survey_questions q
            WHERE q.survey_id = ?;
        `;

        const questions = await new Promise((resolve, reject) => {
            db.query(getQuestionsQuery, [survey_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // Fetch Options for Multiple-Choice Questions
        const questionIds = questions.map(q => q.question_id);
        let options = [];
        
        if (questionIds.length > 0) {
            const getOptionsQuery = `
                SELECT o.option_id, o.question_id, o.option_text
                FROM survey_options o
                WHERE o.question_id IN (?);
            `;

            options = await new Promise((resolve, reject) => {
                db.query(getOptionsQuery, [questionIds], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
        }

        // Merge Questions with Their Options
        const surveyDetails = {
            ...survey,
            questions: questions.map(q => ({
                ...q,
                options: options.filter(opt => opt.question_id === q.question_id)
            }))
        };

        res.status(200).send({
            success: true,
            message: "Survey details fetched successfully",
            survey: surveyDetails,
        });

    } catch (error) {
        console.error("Error fetching survey details: ", error);
        res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};
