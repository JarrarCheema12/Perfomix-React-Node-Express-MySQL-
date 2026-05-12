import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const assignMetric = async (req , res) => {

    try {
        
        const token = req.header("Authorization");
        const {metric_id, line_manager_id, department_id} = req.body;
console.log("metric_id: ", metric_id, "line_manager_id: ", line_manager_id, "department_id: ", department_id);

        if(!metric_id || !line_manager_id || !department_id){
            return res.status(400).send({
                success: false,
                message: "Metric's, Line Manager's and Department's Ids are required"
            });
        }

        if(!token){
            return res.status(400).send({
                success: false,
                message: "Token is missing"
            });
        }

        // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).send({ 
                success: false,
                message: "Invalid token" 
            });
        }



        // CHECK if the metric exist
        const checkMetricExist = `
            SELECT * FROM performance_metrics WHERE metric_id = ? AND is_active = 1;
        `;
console.log("checkMetricExist: ", checkMetricExist);

        const metricExist = await new Promise((resolve, reject) => {
            db.query(checkMetricExist, [metric_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!metricExist){
            return res.status(400).send({
                success: false,
                message: "There is no Active Performace Metric Exist with the given ID"
            });
        }



        // CHECK if the line manager exist
        const checkLineManagerExist = `
            SELECT * FROM users WHERE user_id = ? AND role_id = 2 AND is_active = 1;
        `;

        const lineManagerExist = await new Promise((resolve, reject) => {
            db.query(checkLineManagerExist, [line_manager_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!lineManagerExist){
            return res.status(400).send({
                success: false,
                message: "There is no Active Line Manager Exist with the given ID"
            });
        }



        // CHECK if the department exist
        const checkDepartmentExist = `
            SELECT * FROM departments WHERE dept_id = ? AND is_active = 1;
        `;

        const departmentExist = await new Promise((resolve, reject) => {
            db.query(checkDepartmentExist, [department_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!departmentExist){
            return res.status(400).send({
                success: false,
                message: "There is no Active Department Exist with the given department Id"
            });
        }



        // CHECK if the Line Manager is valid
        const checkLMIsValid = `
            SELECT * FROM users u JOIN user_departments ud ON u.user_id = ud.user_id WHERE ud.department_id = ? AND ud.user_id = ? AND ud.is_line_manager = 1;

        `;

        const isLMValid = await new Promise((resolve, reject) => {
            db.query(checkLMIsValid, [department_id, line_manager_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!isLMValid){
            return res.status(400).send({
                success: false,
                message: "Line Manager is not valid for this Department"
            });
        }
        



        // CHECK if the requested user is the creator of the Metric
        const checkIfCreator = `
            SELECT * FROM performance_metrics WHERE metric_id = ? AND created_by = ?;
        `;

        const isCreator = await new Promise((resolve, reject) => {
            db.query(checkIfCreator, [metric_id, userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!isCreator){
            return res.status(400).send({
                success: false,
                message: "You are not authorized to assign this performance metric to any Line Manager"
            });
        }



        // CHECK IF METRIC IS ALREADY ASSIGNED TO THE SAME LINE MANAGER< DEPARTMENT
        const checkIfDataExist = `
            SELECT * FROM metric_assignments WHERE metric_id = ? AND line_manager_id = ? AND department_id = ?;
        `;

        const result = await new Promise((resolve , reject) => {
            db.query(checkIfDataExist, [metric_id, line_manager_id, department_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results);
                }
            });
        });

        if(result.length > 0){
            return res.status(400).send({
                success: false,
                message: "The given data is already assigned"
            });
        }

        // Check if 'metric_assignments' table exists, create it if it doesn't
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS metric_assignments (
                assignment_id INT PRIMARY KEY AUTO_INCREMENT,
                metric_id INT,
                line_manager_id INT,
                department_id INT,
                assigned_on DATETIME DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_assignment_metric_id FOREIGN KEY (metric_id) REFERENCES performance_metrics(metric_id) ON DELETE SET NULL,
                CONSTRAINT fk_assignment_line_manager_id FOREIGN KEY (line_manager_id) REFERENCES users(user_id) ON DELETE SET NULL,
                CONSTRAINT fk_assignment_department_id FOREIGN KEY (department_id) REFERENCES departments(dept_id) ON DELETE SET NULL
            );

        `;

        await new Promise((resolve, reject) => {
            db.query(createTableQuery, (err, results) => {
                if (err) {
                    console.error("Error creating table:", err);
                    reject(err);
                } else {
                    console.log("Checked/Created 'metric_assignments' table.");
                    resolve(results);
                }
            });
        });



        const insertQuery = `
            INSERT INTO metric_assignments(metric_id, line_manager_id, department_id)
            VALUES(?, ?, ?);
        `;

        const insertMetricAssignment = await new Promise((resolve , reject) => {
            db.query(insertQuery, [metric_id, line_manager_id, department_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results.affectedRows);
                }
            });
        });

        if(insertMetricAssignment > 0){
            return res.status(201).send({
                success: true,
                message: "Metric Assigned Successfully",
            });
        }
        else{
            return res.status(400).send({
                success: false,
                message: "Cannot able to assign metric"
            });
        }




    } catch (error) {
        console.log("Error while assigning metric to Line Manager: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}