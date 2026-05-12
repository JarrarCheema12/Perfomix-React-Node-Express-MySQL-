import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getUser = async (req, res) => {

    try {
        
        // Check if the Authorization header exists
        let token = req.header("Authorization");

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


        const checkIfUserExist = `
            SELECT * FROM users WHERE user_id = ? AND is_active = 1;
        `;

        const isUser = await new Promise((resolve, reject) => {
            db.query(checkIfUserExist, [userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!isUser){
            return res.status(400).send({
                success: false,
                message: "Not found your data"
            });
        }


        const getUserQuery = `
            SELECT u.user_id, u.user_name, u.full_name, u.phone, u.profile_photo, 
            u.role_id, u.designation, o.organization_id, o.organization_name
            FROM users u LEFT JOIN user_departments ud ON u.user_id = ud.user_id
            LEFT JOIN departments d ON ud.department_id = d.dept_id
            LEFT JOIN organizations o ON d.organization_id = o.organization_id WHERE u.user_id = ?
            GROUP BY o.organization_id;
        `;
        
        const user = await new Promise((resolve, reject) => {
            db.query(getUserQuery, [userId], (err, results) => {
                if(err){
                    return reject(err);
                }
                else{
                    return resolve(results[0]);
                }
            });
        });

        if(!user){
            return res.status(400).send({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).send({
            success: true,
            message: "Successfully fetched the user",
            user: user
        });

    } catch (error) {
        console.log("Error while fetching single user data: ", error);
        
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}