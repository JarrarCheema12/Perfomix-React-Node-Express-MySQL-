import db from "../../config/db.js";
import jwt from 'jsonwebtoken';

export const getSurveysForEmployee = async (req, res) => {
    try {
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

        // Ensure User is an Employee (not an Admin)
        if (user.role_id === 1) {
            return res.status(403).send({ success: false, message: "Admins cannot access this data" });
        }

        // Get the Admin who created this Employee
        const adminId = user.created_by;

        if (!adminId) {
            return res.status(400).send({ success: false, message: "No admin found for this employee" });
        }

        // Fetch Surveys Created by This Admin and Exclude Submitted Surveys
        const getSurveysQuery = `
            SELECT 
                s.survey_id, 
                s.title, 
                s.description, 
                s.created_by AS created_by_id,
                u.full_name AS created_by_name,
                s.organization_id, 
                o.organization_name AS organization_name,
                CONVERT_TZ(s.created_at, '+00:00', '+05:00') AS created_at
            FROM surveys s 
            JOIN users u ON s.created_by = u.user_id 
            JOIN organizations o ON o.organization_id = s.organization_id
            LEFT JOIN survey_responses sr ON s.survey_id = sr.survey_id AND sr.employee_id = ?
            WHERE s.created_by = ? AND sr.survey_id IS NULL;
        `;

        const surveys = await new Promise((resolve, reject) => {
            db.query(getSurveysQuery, [userId, adminId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        res.status(200).send({
            success: true,
            message: "Surveys fetched successfully",
            surveys,
        });

    } catch (error) {
        console.error("Error fetching surveys: ", error);
        res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};
