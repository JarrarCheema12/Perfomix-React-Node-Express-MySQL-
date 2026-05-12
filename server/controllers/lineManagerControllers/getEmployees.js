import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getEmployees = async (req, res) => {
    try {
        let token = req.header("Authorization");

        if (!token) {
            return res.status(400).send({
                success: false,
                message: "Token is missing"
            });
        }

        // Verify token and extract user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).send({
                success: false,
                message: "Invalid token"
            });
        }

        // Check if the user is a Line Manager
        const checkLineManagerQuery = `
            SELECT COUNT(*) AS count FROM users 
            WHERE user_id = ? AND role_id = 2 AND is_active = 1;
        `;

        const lineManagerCheck = await new Promise((resolve, reject) => {
            db.query(checkLineManagerQuery, [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0].count);
            });
        });

        if (lineManagerCheck === 0) {
            return res.status(403).send({
                success: false,
                message: "User is not authorized as a Line Manager"
            });
        }

        // Get departments managed by the Line Manager
        const getDepartmentsQuery = `
            SELECT d.dept_id, d.department_name 
            FROM user_departments ud 
            JOIN departments d ON ud.department_id = d.dept_id
            WHERE ud.user_id = ?;
        `;

        const departments = await new Promise((resolve, reject) => {
            db.query(getDepartmentsQuery, [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (departments.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No departments found for this Line Manager"
            });
        }

        // Get all employees in the managed departments (including employees in departments without assigned metrics)
        const departmentIds = departments.map(dept => dept.dept_id);
        const getEmployeesQuery = `
            SELECT 
                u.user_id, 
                u.user_name, 
                u.full_name, 
                u.designation, 
                ud.department_id, 
                d.department_name
            FROM users u
            JOIN user_departments ud ON u.user_id = ud.user_id
            JOIN departments d ON ud.department_id = d.dept_id
            WHERE u.role_id = 3 AND ud.department_id IN (?) AND u.is_active = 1;
        `;

        const employees = await new Promise((resolve, reject) => {
            db.query(getEmployeesQuery, [departmentIds], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (employees.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No employees found in the managed departments"
            });
        }

        // Check evaluation status for each employee
        const employeesWithEvaluationStatus = await Promise.all(employees.map(async (employee) => {
            // Fetch total assigned metric parameters for this employee's department
            const getTotalMetricParamsQuery = `
                SELECT COUNT(mp.parameter_id) AS total_params
                FROM metric_assignments ma
                LEFT JOIN metric_parameters mp ON ma.metric_id = mp.metric_id
                WHERE ma.department_id = ? AND ma.line_manager_id = ?;
            `;

            const totalMetricParams = await new Promise((resolve, reject) => {
                db.query(getTotalMetricParamsQuery, [employee.department_id, userId], (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]?.total_params || 0); // Default to 0 if no metrics assigned
                });
            });

            // Fetch count of evaluated parameters for this employee
            const getEvaluatedParamsQuery = `
                SELECT COUNT(e.parameter_id) AS evaluated_params
                FROM evaluations e
                LEFT JOIN metric_parameters mp ON e.parameter_id = mp.parameter_id
                LEFT JOIN metric_assignments ma ON mp.metric_id = ma.metric_id
                WHERE e.employee_id = ? AND ma.department_id = ? AND ma.line_manager_id = ?;
            `;

            const evaluatedParams = await new Promise((resolve, reject) => {
                db.query(getEvaluatedParamsQuery, [employee.user_id, employee.department_id, userId], (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]?.evaluated_params || 0); // Default to 0 if no evaluations exist
                });
            });

            // Determine evaluation status
            let evaluationStatus = "Pending";

            if (evaluatedParams === totalMetricParams && totalMetricParams !== 0) {
                evaluationStatus = "Complete";
            }

            return {
                user_id: employee.user_id,
                user_name: employee.user_name,
                full_name: employee.full_name,
                designation: employee.designation,
                department: {
                    department_id: employee.department_id,
                    department_name: employee.department_name
                },
                evaluation_status: evaluationStatus
            };
        }));

        return res.status(200).send({
            success: true,
            message: "Employees fetched successfully",
            employees_count: employeesWithEvaluationStatus.length,
            employees: employeesWithEvaluationStatus
        });

    } catch (error) {
        console.log("Error while fetching employees: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
