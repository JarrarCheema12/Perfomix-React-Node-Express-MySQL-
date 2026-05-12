import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const createPerformanceParameter = async (req , res) => {

    try {
        
        const {id} = req.params;
        console.log("METRIC ID: ", id);
        const {parameter_name, parameter_description, weightage} = req.body;
        let token = req.header("Authorization");


        if(!parameter_name || !parameter_description || !weightage){
            return res.status(400).send({
                success: false,
                message: "parameter name, description and weightage required"
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


        const checkUserIsAdmin = `
            SELECT * FROM users WHERE user_id = ? AND (created_by IS NULL OR created_by = 0);
        `;

        const isAdmin = await new Promise((resolve, reject) => {
            db.query(checkUserIsAdmin, [userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });


        if(!isAdmin){
            return res.status(400).send({
                success:false,
                message: "Only Admin can create a Performance parameter"
            });
        }


        // ------------- PERFORMANCE METRIC VALIDATION THAT IF IT EXIST?
        

        if(!id){
            return res.status(400).send({
                success: false,
                message: "Performance metric Id is required"
            });
        }

        const checkMetricExist = `
            SELECT * FROM performance_metrics WHERE metric_id = ? AND created_by = ?;
        `;

        const metricExist = await new Promise((resolve, reject) => {
            db.query(checkMetricExist, [id, userId], (err, results) => {
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
                message: "No such Performance Metric Exist with the given Metric Id that has created by you"
            });
        }


        // Check if 'performance_parameters' table exists, create it if it doesn't
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS performance_parameters (
                parameter_id INT AUTO_INCREMENT PRIMARY KEY,
                parameter_name VARCHAR(255) NOT NULL,
                description TEXT,
                created_by INT,
                created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active TINYINT DEFAULT 1,
                CONSTRAINT fk_parameter_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
            );
        `;

        await new Promise((resolve, reject) => {
            db.query(createTableQuery, (err, results) => {
                if (err) {
                    console.error("Error creating table:", err);
                    reject(err);
                } else {
                    console.log("Checked/Created 'performance_parameters' table.");
                    resolve(results);
                }
            });
        });


        
        // Check if 'metric_parameters' table exists, create it if it doesn't
        const createQuery = `
            CREATE TABLE IF NOT EXISTS metric_parameters (
				metric_param_id INT PRIMARY KEY AUTO_INCREMENT,
                metric_id INT,
                parameter_id INT,
                weightage DECIMAL(5, 2) NOT NULL CHECK (weightage BETWEEN 0 AND 100),
                CONSTRAINT fk_id FOREIGN KEY (metric_id) REFERENCES performance_metrics(metric_id) ON DELETE SET NULL,
                CONSTRAINT fk_parameter_id FOREIGN KEY (parameter_id) REFERENCES performance_parameters(parameter_id) ON DELETE SET NULL
            );

        `;

        await new Promise((resolve, reject) => {
            db.query(createQuery, (err, results) => {
                if (err) {
                    console.error("Error creating table:", err);
                    reject(err);
                } else {
                    console.log("Checked/Created 'metric_parameters' table.");
                    resolve(results);
                }
            });
        });



        const checkparameterExist = `
            SELECT * FROM performance_parameters WHERE parameter_name = ?;
        `;

        const parameterExist = await new Promise((resolve, reject) => {
            db.query(checkparameterExist, [parameter_name], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(parameterExist){
            return res.status(400).send({
                success: false,
                message: "Performance parameter with the given name already exist"
            });
        }


        const insertParameterQuery = `
            INSERT INTO performance_parameters(parameter_name, description, created_by)
            VALUES(?, ?, ?);
        `;
    
        const parameter_id = await new Promise((resolve, reject) => {
            db.query(insertParameterQuery, [parameter_name, parameter_description, userId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.insertId);
                }
            });
        });



        const insertMetricParameterQuery = `
            INSERT INTO metric_parameters(metric_id, parameter_id, weightage)
            VALUES(?, ?, ?);
        `;

        const parameterCount = await new Promise((resolve, reject) =>{
            db.query(insertMetricParameterQuery, [id, parameter_id, weightage], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results.affectedRows);
                }
            });
        });



        if(parameterCount > 0){
            return res.status(201).send({
                success: true,
                message: "Performance parameter created successfully. Now you can assign it to a Line Manager"
            });
        }
        else{
            return res.status(400).send({
                success: true,
                message: "Not created performance parameter"
            });
        }


    } catch (error) {
        console.log("Error while creating performance parameters: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}