import db from "../../config/db.js";
import jwt from "jsonwebtoken";

export const getSurveyResponse = async (req, res) => {
    try {
        const { survey_id, user_id } = req.params;
        let token = req.header("Authorization");

        if (!token) {
            return res.status(401).send({ success: false, message: "Authorization token is required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin_id = decoded.id;

        // Check if user is an Admin
        const getAdminQuery = "SELECT role_id FROM users WHERE user_id = ? AND is_active = 1;";
        const admin = await new Promise((resolve, reject) => {
            db.query(getAdminQuery, [admin_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!admin || admin.role_id !== 1) {
            return res.status(403).send({ success: false, message: "Only admins can view employee responses" });
        }

        // Check if Survey Exists & Belongs to Admin
        const getSurveyQuery = "SELECT survey_id, title, description FROM surveys WHERE survey_id = ? AND created_by = ?;";
        const survey = await new Promise((resolve, reject) => {
            db.query(getSurveyQuery, [survey_id, admin_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!survey) {
            return res.status(404).send({ success: false, message: "Survey not found or does not belong to this admin" });
        }

        const getUserData = `
            SELECT * FROM users WHERE user_id = ? AND is_active = 1 AND created_by = ?;
        `;

        const user = await new Promise((resolve , reject) => {
            db.query(getUserData, [user_id, admin_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!user){
            return res.status(400).send({
                success: false,
                message: "User not found"
            });
        }

        const query = `
            SELECT 
                q.question_id,
                q.question_text,
                a.answer_text,
                o.option_text
            FROM survey_questions q
            LEFT JOIN survey_answers a ON q.question_id = a.question_id
            LEFT JOIN survey_options o ON a.option_id = o.option_id
            JOIN survey_responses r ON a.response_id = r.response_id
            WHERE r.survey_id = ? AND r.employee_id = ?;
        `;

        db.query(query, [survey_id, user_id], (error, results) => {
            if (error) {
                console.error("Error retrieving survey responses:", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            res.status(200).json({
                survey_id,
                survey_title: survey.title,
                survey_description: survey.description,
                user_id,
                user_name: user.user_name,
                full_name: user.full_name,
                email: user.email,
                responses: results
            });
        });

    } catch (error) {
        console.error("Error retrieving survey responses: ", error);
        res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};
