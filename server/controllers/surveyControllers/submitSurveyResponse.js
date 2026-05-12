import db from "../../config/db.js";
import jwt from "jsonwebtoken";

export const submitSurveyResponse = async (req, res) => {
    try {
        const { survey_id } = req.params;
        const { answers } = req.body; // Array of answers [{question_id, option_id, answer_text}]

        if (!survey_id || !answers || answers.length === 0) {
            return res.status(400).send({ success: false, message: "Survey ID and answers are required" });
        }

        // Authorization Check
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({ success: false, message: "Authorization token is required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const employee_id = decoded.id;

        // Check if Employee Exists & is Active
        const getUserQuery = "SELECT user_id, role_id FROM users WHERE user_id = ? AND is_active = 1;";
        const user = await new Promise((resolve, reject) => {
            db.query(getUserQuery, [employee_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!user) {
            return res.status(404).send({ success: false, message: "Employee not found or inactive" });
        }

        if (user.role_id === 1) {
            return res.status(403).send({ success: false, message: "Admins cannot submit survey responses" });
        }

        // Check if the survey exists
        const checkSurveyQuery = "SELECT COUNT(*) AS count FROM surveys WHERE survey_id = ?";
        const surveyExists = await new Promise((resolve, reject) => {
            db.query(checkSurveyQuery, [survey_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0].count > 0);
            });
        });

        if (!surveyExists) {
            return res.status(400).send({ success: false, message: "Invalid Survey ID" });
        }

        // Fetch required questions for this survey
        const getSurveyQuestionsQuery = "SELECT question_id FROM survey_questions WHERE survey_id = ?";
        const surveyQuestions = await new Promise((resolve, reject) => {
            db.query(getSurveyQuestionsQuery, [survey_id], (err, results) => {
                if (err) reject(err);
                else resolve(results.map(q => q.question_id));
            });
        });

        // Validate answers: ensure only allowed questions are answered and all required ones are included
        const submittedQuestionIds = answers.map(ans => ans.question_id);
        const missingQuestions = surveyQuestions.filter(qid => !submittedQuestionIds.includes(qid));
        const extraQuestions = submittedQuestionIds.filter(qid => !surveyQuestions.includes(qid));

        if (missingQuestions.length > 0) {
            return res.status(400).send({ 
                success: false, 
                message: `Missing answers for questions: ${missingQuestions.join(", ")}` 
            });
        }

        if (extraQuestions.length > 0) {
            return res.status(400).send({ 
                success: false, 
                message: `Invalid questions in submission: ${extraQuestions.join(", ")}` 
            });
        }

        // Insert Survey Response
        const insertResponseQuery = "INSERT INTO survey_responses (survey_id, employee_id, submitted_at) VALUES (?, ?, NOW());";
        const responseId = await new Promise((resolve, reject) => {
            db.query(insertResponseQuery, [survey_id, employee_id], (err, result) => {
                if (err) reject(err);
                else resolve(result.insertId);
            });
        });

        if (!responseId) {
            return res.status(500).send({ success: false, message: "Error inserting survey response" });
        }

        // Insert Answers into `survey_answers` Table
        const insertAnswersQuery = `
            INSERT INTO survey_answers (response_id, question_id, option_id, answer_text)
            VALUES ?
        `;

        const answerValues = answers.map(ans => [
            responseId, 
            ans.question_id, 
            ans.option_id || null,  // NULL if no option_id
            ans.answer_text || null // NULL if it's multiple-choice
        ]);

        await new Promise((resolve, reject) => {
            db.query(insertAnswersQuery, [answerValues], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        res.status(200).send({
            success: true,
            message: "Survey submitted successfully",
            response_id: responseId
        });

    } catch (error) {
        console.error("Error submitting survey: ", error);
        res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};
