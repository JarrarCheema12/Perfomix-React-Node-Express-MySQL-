import db from "../../config/db.js";
import jwt from "jsonwebtoken";

export const getAdminSurveys = async (req, res) => {
    try {
        const { organization_id } = req.params;
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


        const checkOrganizationExist = `
            SELECT * FROM organizations WHERE organization_id = ? AND created_by = ?;
        `;

        const organization = await new Promise((resolve , reject) => {
            db.query(checkOrganizationExist, [organization_id, admin_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!organization){
            return res.status(400).send({
                success: false,
                message: "Organization not found"
            });
        }

        

        if (!admin || admin.role_id !== 1) {
            return res.status(403).send({ success: false, message: "Only admins can view surveys" });
        }

        // Fetch Surveys Created by the Admin
        const getSurveysQuery = "SELECT survey_id, title, CONVERT_TZ(created_at, '+00:00', '+05:00') AS created_at FROM surveys WHERE created_by = ?;";
        const surveys = await new Promise((resolve, reject) => {
            db.query(getSurveysQuery, [admin_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (surveys.length === 0) {
            return res.status(200).send({ success: true, message: "No surveys found", surveys: [] });
        }

        // Get Total Employees in Organization (excluding admin)
        const getTotalEmployeesQuery = `
            SELECT COUNT(*) AS total_employees FROM (SELECT u.user_id FROM users u JOIN user_departments ud ON u.user_id = ud.user_id
            JOIN departments d ON ud.department_id = d.dept_id
            JOIN organizations o ON d.organization_id = o.organization_id
            WHERE o.organization_id = ? AND ud.user_id != ? GROUP BY ud.user_id) AS subquery; 
        `;
        const totalEmployees = await new Promise((resolve, reject) => {
            db.query(getTotalEmployeesQuery, [organization_id, admin_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0].total_employees);
            });
        });

        // Process Each Survey to Get Submission Counts
        const surveyResults = await Promise.all(surveys.map(async (survey) => {
            // Get Count of Employees Who Submitted This Survey
            const getSubmittedCountQuery = `
                SELECT COUNT(DISTINCT employee_id) AS submitted_count 
                FROM survey_responses 
                WHERE survey_id = ?;
            `;
            const submittedCount = await new Promise((resolve, reject) => {
                db.query(getSubmittedCountQuery, [survey.survey_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0].submitted_count);
                });
            });

            // Calculate Employees Who Have Not Submitted
            const notSubmittedCount = totalEmployees - submittedCount;

            return {
                survey_id: survey.survey_id,
                survey_title: survey.title,
                created_at: survey.created_at,
                total_employees: totalEmployees,
                submitted_count: submittedCount,
                not_submitted_count: notSubmittedCount,
            };
        }));

        res.status(200).send({
            success: true,
            message: "Admin surveys retrieved successfully",
            surveys: surveyResults,
        });

    } catch (error) {
        console.error("Error retrieving surveys: ", error);
        res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};
