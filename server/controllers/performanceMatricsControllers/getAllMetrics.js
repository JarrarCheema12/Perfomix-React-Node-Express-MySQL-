import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getAllMetrics = async (req , res) => {

    try {
        
        let token = req.header("Authorization");

        if (!token) {
            return res.status(400).send({
                success: false,
                message: "Token is missing",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).send({
                success: false,
                message: "Invalid token",
            });
        }

        const checkIfAdmin = `
            SELECT * FROM users WHERE user_id = ? AND role_id = 1 AND is_active = 1;
        `;

        const admin = await new Promise((resolve, reject) => {
            db.query(checkIfAdmin, [userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!admin){
            return res.status(400).send({
                success: false,
                message: "Only admin can view the Performance Metrics"
            });
        }

        const getMetrics = `
            SELECT DISTINCT 
                pm.metric_id, 
                pm.metric_name, 
                pm.description AS metric_description, 
                d.dept_id AS department_id, 
                d.department_name, 
                GROUP_CONCAT(u.user_id ORDER BY u.user_id SEPARATOR ',') AS lm_ids,
                GROUP_CONCAT(u.full_name ORDER BY u.user_id SEPARATOR ', ') AS lm_names
            FROM performance_metrics pm 
            LEFT JOIN metric_assignments ma ON pm.metric_id = ma.metric_id 
            LEFT JOIN departments d ON ma.department_id = d.dept_id 
            LEFT JOIN users u ON ma.line_manager_id = u.user_id 
            WHERE pm.created_by = ?
            GROUP BY pm.metric_id, pm.metric_name, pm.description, d.dept_id, d.department_name;
        `;


        const metrics = await new Promise((resolve, reject) => {
            db.query(getMetrics, [userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results);
                }
            });
        });

        if(!metrics){
            return res.status(400).send({
                success: false,
                message: "Performance Metrics not found"
            });
        }

        console.log("Metrics: ", metrics[0]);
        

        return res.status(200).send({
            success: true,
            message: "Performance Metrics fetched successfully",
            metrics: metrics
        });

    } catch (error) {
        console.log("Error while fetching all performance metrics: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}