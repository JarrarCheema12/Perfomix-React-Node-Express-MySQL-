import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const createPerformanceMetrics = async (req , res) => {

    try {
        
        const {metric_name, metric_description} = req.body;
        let token = req.header("Authorization");

        if(!metric_name || !metric_description){
            return res.status(400).send({
                success: false,
                message: "metric name and description required"
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
                message: "Only Admin can create a Performance metrics"
            });
        }


        // Check if 'performance_metrics' table exists, create it if it doesn't
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS performance_metrics (
                metric_id INT AUTO_INCREMENT PRIMARY KEY,
                metric_name VARCHAR(255) NOT NULL,
                description TEXT,
                created_by INT,
                created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active TINYINT DEFAULT 1,
                CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
            );

        `;

        await new Promise((resolve, reject) => {
            db.query(createTableQuery, (err, results) => {
                if (err) {
                    console.error("Error creating table:", err);
                    reject(err);
                } else {
                    console.log("Checked/Created 'performance_metrics' table.");
                    resolve(results);
                }
            });
        });


        const checkmetricExist = `
            SELECT * FROM performance_metrics WHERE metric_name = ?;
        `;

        const metricExist = await new Promise((resolve, reject) => {
            db.query(checkmetricExist, [metric_name], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(metricExist){
            return res.status(400).send({
                success: false,
                message: "Performance metric with the given name already exist"
            });
        }


        const insertmetricQuery = `
            INSERT INTO performance_metrics(metric_name, description, created_by)
            VALUES(?, ?, ?);
        `;

        const metricCount = await new Promise((resolve, reject) =>{
            db.query(insertmetricQuery, [metric_name, metric_description, userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results.affectedRows);
                }
            });
        });

        if(metricCount > 0){
            return res.status(201).send({
                success: true,
                message: "Performance Metric created successfully. Now you can add parameters in it"
            });
        }
        else{
            return res.status(400).send({
                success: true,
                message: "Not created performance metric"
            });
        }


    } catch (error) {
        console.log("Error while creating performance metrics: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}