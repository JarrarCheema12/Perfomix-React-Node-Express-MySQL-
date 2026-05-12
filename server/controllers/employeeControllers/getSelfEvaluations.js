import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getSelfEvaluations = async (req , res) => {

    try {
        
         // Check if the Authorization header exists
         let token = req.header("Authorization");
         if (!token) {
             return res.status(401).send({ message: "Authorization token is required" });
         }

         // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;
                 
        if (!user_id) {
            return res.status(401).send({ message: "Invalid token" });
        }

        const getUser = `
            SELECT * FROM users WHERE user_id = ? AND is_active = 1;
        `;

        const user = await new Promise((resolve , reject) => {
            db.query(getUser, [user_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!user){
            return res.status(400).send({
                success: false,
                message: "Error while retreiving your data"
            });
        }

        if(user.role_id == 1 || user.role_id === 1 || user.role_id === '1'){
            return res.status(400).send({
                success: false,
                message: "Admins cannot able to get the Evaluation's Results"
            });
        }


        if(user.role_id == 2 || user.role_id === 2 || user.role_id === '2'){

            const getLMEvaluations = `
                SELECT lme.evaluation_id, lme.metric_id, pm.metric_name, lme.parameter_id, pp.parameter_name, 
                mp.weightage AS total_weightage, lme.marks_obtained, lme.admin_id AS evaluated_by_id, 
                ad.full_name AS evaluated_by_name, lme.feedback, CONVERT_TZ(lme.evaluated_on, '+00:00', '+05:00') AS evaluated_on
                FROM line_manager_evaluations lme 
                JOIN performance_metrics pm ON lme.metric_id = pm.metric_id
                JOIN performance_parameters pp ON lme.parameter_id = pp.parameter_id
                JOIN metric_parameters mp ON pp.parameter_id = mp.parameter_id
                JOIN users ad ON lme.admin_id = ad.user_id
                JOIN users lm ON lme.line_manager_id = lm.user_id
                WHERE lme.line_manager_id = ?;
            `

            const lmEvaluations = await new Promise((resolve , reject) => {
                db.query(getLMEvaluations, [user_id], (err, results) => {
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(results);
                    }
                });
            });


            return res.status(200).send({
                success: true,
                message: "Line Manager's Evaluations fetched successfully",
                total_evaluations: lmEvaluations.length,
                evaluations: lmEvaluations.length > 0 ? lmEvaluations : "No Evaluations evaluated for you by your Admin"
            });

        }


        if(user.role_id == 3 || user.role_id === 3 || user.role_id === '3'){

            const getEmpEvaluations = `
                SELECT e.evaluation_id, e.metric_id, pm.metric_name, e.parameter_id, pp.parameter_name, 
                mp.weightage AS total_weightage, e.marks_obtained, e.line_manager_id AS evaluated_by_id, 
                lm.full_name AS evaluated_by_name, e.feedback, CONVERT_TZ(e.evaluated_on, '+00:00', '+05:00') AS evaluated_on
                FROM evaluations e 
                JOIN performance_metrics pm ON e.metric_id = pm.metric_id
                JOIN performance_parameters pp ON e.parameter_id = pp.parameter_id
                JOIN metric_parameters mp ON pp.parameter_id = mp.parameter_id
                JOIN users lm ON e.line_manager_id = lm.user_id
                JOIN users emp ON e.employee_id = emp.user_id
                WHERE e.employee_id = ?;
            `

            const empEvaluations = await new Promise((resolve , reject) => {
                db.query(getEmpEvaluations, [user_id], (err, results) => {
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(results);
                    }
                });
            });


            return res.status(200).send({
                success: true,
                message: "Staff's Evaluations fetched successfully",
                total_evaluations: empEvaluations.length,
                evaluations: empEvaluations.length > 0 ? empEvaluations : "No Evaluations evaluated for you by your Line Manager"
            });

        }


        return res.status(400).send({
            success: false,
            message: "No data found"
        });


    } catch (error) {
        console.log("Error while fetching evaluations: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}