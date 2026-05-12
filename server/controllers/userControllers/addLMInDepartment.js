import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const addLMInDepartment = async (req , res) => {

    try {
        
        const {line_manager_id , department_id} = req.body;
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

        if(!line_manager_id || !department_id){
            return res.status(400).send({
                success: false,
                message: "Line Manager and Department Id both are required"
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


        const checkIfDeptAdmin = `
            SELECT * FROM departments WHERE dept_id = ? AND created_by = ? AND is_active = 1;
        `;

        const deptAdmin = await new Promise((resolve, reject) => {
            db.query(checkIfDeptAdmin, [department_id, userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });



        if(!admin || !deptAdmin){
            return res.status(400).send({
                success: false,
                message: "Only Admin of the department can add the Line Manager in the department"
            });
        }

        
        const checkIfLM = `
            SELECT * FROM users WHERE user_id = ? AND role_id = 2 AND is_active = 1;
        `;

        const lineManager  = await new Promise((resolve, reject) => {
            db.query(checkIfLM, [line_manager_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!lineManager){
            return res.status(400).send({
                success: false,
                message: "Given Line Manager not found"
            });
        }


        // ADD LINE MANAGER IN THE DEPARTMENT
        const insertLMInDept = `
            INSERT INTO user_departments(user_id, department_id, is_line_manager)
            VALUES(?, ?, ?);
        `;

        const result = await new Promise((resolve, reject) => {
            db.query(insertLMInDept, [line_manager_id, department_id, 1], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results.affectedRows);
                }
            });
        });

        if(result === 1 || result === '1')
        {
            return res.status(201).send({
                success: true,
                message: "Line Manager added successfully"
            });
        }

        return res.status(400).send({
            success: true,
            message: "Line Manager does not able to added"
        });

    } catch (error) {
        console.log("Error while adding Line Manager to department: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}