import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const viewAllPerformanceMetrics = async (req , res) => {

    try {
        
        // Check if the Authorization header exists
        let token = req.header("Authorization");

        if (!token) {
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

        const checkIfAdmin = `
            SELECT * FROM users WHERE user_id = ? AND is_active = 1 AND (created_by IS NULL OR created_by = 0);
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
                message: 'Only Admin can view the created Performance Metrics'
            });
        }


        const getAllPerformanceMetrics = `
            SELECT pm.metric_id, pm.metric_name, pm.description AS metric_description, 
            pp.parameter_id, pp.parameter_name, pp.description AS parameter_description, mp.weightage, 
            u.user_id AS line_manager_id, u.user_name AS line_manager_user_name, u.full_name AS line_manager_full_name
            FROM performance_metrics pm 
            JOIN metric_parameters mp ON pm.metric_id = mp.metric_id
            JOIN performance_parameters pp ON mp.parameter_id = pp.parameter_id
            JOIN metric_assignments ma ON pm.metric_id = ma.metric_id
            JOIN users u ON ma.line_manager_id = u.user_id
            WHERE pm.created_by = 1 AND pp.created_by = 1;
        `

        const performanceMetrics = await new Promise((resolve, reject) => {
            db.query(getAllPerformanceMetrics, [userId, userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0])
                }
            });
        });

        if(!performanceMetrics){
            return res.status(400).send({
                success: false,
                message: "Not any Performance Metrics found created by you"
            });
        }

        return res.status(200).send({
            success: true,
            message: "Perfomance Metrics created by you fetched successfully",
            performanceMetrics: performanceMetrics
        });


    } catch (error) {
        console.log("Error while fetching Performance Metrics: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}