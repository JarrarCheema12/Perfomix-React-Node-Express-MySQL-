import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getAllEmployees = async (req, res) => {
    try {

        const {organization_id} = req.params;
        let token = req.header("Authorization");

        if (!token) {
            return res.status(400).send({
                success: false,
                message: "Token is missing"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).send({
                success: false,
                message: "Invalid token"
            });
        }

        if(!organization_id){
            return res.status(400).send({
                success: false,
                message: "Organization Id is required"
            });
        }

        // Check if the user is an Admin with a selected organization
        const checkIfUserIsAdmin = `
            SELECT * FROM users 
            WHERE user_id = ? AND (created_by IS NULL OR created_by = 0);
        `;

        const admin = await new Promise((resolve, reject) => {
            db.query(checkIfUserIsAdmin, [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!admin) {
            return res.status(400).send({
                success: false,
                message: "Only an Admin can get all employees of the organization"
            });
        }

        const organizationId = organization_id;

        // Get all Employees (Line Managers & Staff)
        const getEmployees = `
            SELECT 
                u.user_id, 
                u.user_name,
                u.full_name, 
                u.designation,
                u.role_id,
                d.dept_id,
                d.department_id, 
                d.department_name 
            FROM users u 
            JOIN user_departments ud ON u.user_id = ud.user_id 
            JOIN departments d ON ud.department_id = d.dept_id 
            WHERE u.role_id IN (2, 3) AND d.organization_id = ? AND u.is_active = 1 AND d.is_active = 1;
        `;

        const employees = await new Promise((resolve, reject) => {
            db.query(getEmployees, [organizationId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        if (!employees.length) {
            return res.status(400).send({
                success: false,
                message: "No Employees found for the selected organization"
            });
        }

        // Fetch Performance Status for each Employee
        const employeesWithPerformance = await Promise.all(employees.map(async (emp) => {
            const getPerformanceQuery = `
                SELECT
                    pm.metric_name, 
                    pp.parameter_name, 
                    mp.weightage, 
                    e.marks_obtained 
                FROM evaluations e
                JOIN performance_metrics pm ON e.metric_id = pm.metric_id
                JOIN performance_parameters pp ON e.parameter_id = pp.parameter_id
                JOIN metric_parameters mp ON e.metric_id = mp.metric_id AND e.parameter_id = mp.parameter_id
                WHERE e.employee_id = ?;
            `;

            const performanceData = await new Promise((resolve, reject) => {
                db.query(getPerformanceQuery, [emp.user_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            return {
                user_id: emp.user_id,
                user_name: emp.user_name,
                full_name: emp.full_name,
                designation: emp.designation,
                role_id: emp.role_id,
                dept_id: emp.dept_id,
                department_id: emp.department_id,
                department: emp.department_name,
                performance_status: performanceData.length ? performanceData : "No evaluations available"
            };
        }));

        return res.status(200).send({
            success: true,
            message: "Employees with performance data fetched successfully",
            Employees_Count: employeesWithPerformance.length,
            Employees: employeesWithPerformance
        });

    } catch (error) {
        console.log("Error while fetching Employees: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
