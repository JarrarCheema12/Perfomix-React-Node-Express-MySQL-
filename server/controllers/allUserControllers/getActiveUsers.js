import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getActiveUsers = async (req , res) => {

    try {
        
        const {organization_id} = req.body;

        if(!organization_id){
            return res.status(400).send({
                success: false,
                message: "Organization Id is required"
            });
        }

        const token = req.header('Authorization');

         if(!token){
            return res.status(400).send({
                success: false,                    
                message: "Token is missiing"
            });                
        }
        
        // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;
        
        if(!user_id) {
            return res.status(401).send({ 
                success: false,
                message: "Invalid token" 
            });
        }


        // Check if user is active
        const checkUserIsActive = `
            SELECT * FROM users WHERE user_id = ? AND is_active = 1;
        `;

        const user = await new Promise((resolve, reject) => {
            db.query(checkUserIsActive, [user_id], (err, results) => {
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
                message: "You are not an active registered user"
            });
        }


        // Get Departments Ids of the departments in the organization
        const getDeptIds = `
            SELECT dept_id FROM departments d JOIN user_departments ud ON d.dept_id = ud.department_id 
            WHERE d.organization_id = ? GROUP BY ud.department_id;
        `;

        const deptIds = await new Promise((resolve, reject) => {
            db.query(getDeptIds, [organization_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results);
                }
            });
        });


        console.log("DEPT IDS: ", deptIds);
        console.log("DEPT IDS LENGTH: ", deptIds.length);
        console.log("DEPT [1]: ", deptIds[0].dept_id);
        
        

    } catch (error) {
        console.log("Error while fetching active users: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}