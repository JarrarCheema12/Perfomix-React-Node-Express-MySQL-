import db from "../../config/db.js";
import jwt from "jsonwebtoken";

export const getAdminSingleSurvey = async (req, res) => {
    try {
        const { survey_id } = req.params;
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
            return res.status(403).send({ success: false, message: "Only admins can view survey details" });
        }

        // Fetch Survey Details
        const getSurveyQuery = "SELECT survey_id, title, description, CONVERT_TZ(created_at, '+00:00', '+05:00') AS created_at FROM surveys WHERE survey_id = ? AND created_by = ?;";
        const survey = await new Promise((resolve, reject) => {
            db.query(getSurveyQuery, [survey_id, admin_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!survey) {
            return res.status(404).send({ success: false, message: "Survey not found or does not belong to this admin" });
        }

        // Get Total Employees in Organization (excluding admin)
        const getTotalEmployeesQuery = `
            SELECT user_id, full_name, email, designation 
            FROM users 
            WHERE created_by = ? AND user_id != ?;
        `;
        const allEmployees = await new Promise((resolve, reject) => {
            db.query(getTotalEmployeesQuery, [admin_id, admin_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // Get Employees Who Submitted the Survey
        const getSubmittedEmployeesQuery = `
            SELECT u.user_id, u.full_name, u.email, u.designation
            FROM users u
            INNER JOIN survey_responses sr ON u.user_id = sr.employee_id
            WHERE sr.survey_id = ?;
        `;
        const submittedEmployees = await new Promise((resolve, reject) => {
            db.query(getSubmittedEmployeesQuery, [survey_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // Find Employees Who Have Not Submitted
        const submittedIds = new Set(submittedEmployees.map(emp => emp.user_id));
        const notSubmittedEmployees = allEmployees.filter(emp => !submittedIds.has(emp.user_id));

        res.status(200).send({
            success: true,
            message: "Survey details retrieved successfully",
            survey,
            total_employees: allEmployees.length,
            submitted_count: submittedEmployees.length,
            not_submitted_count: notSubmittedEmployees.length,
            submitted_employees: submittedEmployees,
            not_submitted_employees: notSubmittedEmployees,
        });

    } catch (error) {
        console.error("Error retrieving survey details: ", error);
        res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};
