import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const selectOrganization = async (req , res) => {

    try {
        
        const { organization_id } = req.body;

        if(!organization_id){
            return res.status(400).send({
                success: false,
                message: "Organization id is required"
            });
        }

        // Check if the Authorization header exists
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({ 
                success: false,
                message: "Authorization token is required" 
            });
        }

        // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;

        if (!user_id) {
            return res.status(401).send({ 
                success: false,
                message: "Invalid token" 
            });
        }


        const checkIfAdmin = `
            SELECT * FROM users WHERE user_id = ? AND created_by IS NULL OR created_by = 0 AND is_active = 1;
        `;

        const admin = await new Promise((resolve, reject) => {
            db.query(checkIfAdmin, [user_id], (err, results) => {
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
                message: "You are not an Admin"
            })
        }



        const checkOrganization = `
            SELECT * FROM organizations WHERE organization_id = ? AND is_active = 1;
        `;

        const organization = await new Promise((resolve, reject) => {
            db.query(checkOrganization, [organization_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!organization){
            return res.status(400).send({
                success: false,
                message: "Organization is not present with the given id"
            });
        }


        const updateUserForSelectedOrganization = `
            UPDATE users SET selected_organization_id = ? WHERE user_id = ?;
        `;

        const result = await new Promise((resolve, reject) => {
            db.query(updateUserForSelectedOrganization, [organization_id, user_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results.affectedRows);
                }
            });
        });


        if(result !== 1){
            return res.status(400).send({
                success: false,
                message: "Cannot able to add selected orgnaization id in the users table"
            });
        }

        return res.status(200).send({
            success: true,
            message: "Organization selected successfully!",
        });


    } catch (error) {
        console.log("Error while selecting an Organization: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}