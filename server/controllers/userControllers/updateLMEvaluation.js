import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const updateLMEvaluation = async (req , res) => {

    try {
        
        const evaluation_id = req.params;
        const { marks_obt, feedback } = req.body

        if(!evaluation_id){
            return res.status(400).send({
                success: false,
                message: "Evaluation Id is missing in the Params"
            });
        }

        if(!marks_obt && !feedback){
            return res.status(400).send({
                success: false,
                message: 'Either Marks Obtained or Feedback require to update the Evaluation'
            });
        }

        // Check if the Authorization header exists
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({ message: "Authorization token is required" });
        }

        // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
                
        if (!userId) {
            return res.status(401).send({ message: "Invalid token" });
        }


        const checkIfEvaluationExist = `
            SELECT * FROM line_manager_evaluations WHERE evaluation_id = ? AND admin_id = ?;
        `;

        const evaluation = await new Promise((resolve, reject) => {
            db.query(checkIfEvaluationExist, [evaluation_id, userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!evaluation){
            return res.status(400).send({
                success: false,
                message: "Evaluation not found with the Given Id that you have created"
            });
        }


        // Build dynamic query and params
        let query = `UPDATE line_manager_evaluations SET `;
        const queryParams = [];

        if (marks_obt) {
        query += `marks_obtained = ?, `;
        queryParams.push(marks_obt);
        }

        if (feedback) {
        query += `feedback = ?, `;
        queryParams.push(feedback);
        }

        // Remove the trailing comma and add WHERE condition
        query = query.slice(0, -2) + ` WHERE evaluation_id = ? AND admin_id = ?;`;
        queryParams.push(evaluation_id, userId);

        const result = await new Promise((resolve, reject) => {
            db.query(query, queryParams, (err, results) => {
                if (err) {
                reject(err);
                } else {
                resolve(results.affectedRows);
                }
            });
        });

        if (result !== 1) {
            return res.status(400).send({
                success: false,
                message: "Unable to update the Line Manager Evaluation",
            });
        }

        return res.status(201).send({
            success: true,
            message: "Line Manager Evaluation updated successfully"
        });


    } catch (error) {
        console.log("Error while updating the Line Manager Evaluation: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}