import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const setProfilePicture = async (req , res) => {

    try {
        
        const token = req.header('Authorization');
        // Get profile photo path
        const profilePhotoPath = req.file ? req.file.path : null;

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


        const getUser = `
            SELECT * FROM users WHERE user_id = ?;
        `;

        const user = await new Promise((resolve, reject) => {
            db.query(getUser, [userId], (err, results) => {
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
                message: "User not exist"
            })
        }

        const updateUserQuery = `
            UPDATE users SET profile_photo = ? WHERE user_id = ?;
        `;

        const result = await new Promise((resolve, reject) => {
            db.query(updateUserQuery, [profilePhotoPath, userId], (err, results) => {
                if (err) {
                    reject(err);
                } else if (results.affectedRows === 0) {
                    reject(new Error("No rows updated"));
                } else {
                    resolve(results.affectedRows);
                }
            });
        });

        if(result < 1){
            return res.status(400).send({
                success: false,
                message: "Profile Picture cannot be able to updated"
            });
        }

        return res.status(201).send({
            success: false,
            message: "Profile Picture sets successfully"
        })

    } catch (error) {
        console.log("Error while setting profile picture: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}