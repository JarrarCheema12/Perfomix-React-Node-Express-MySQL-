import { comparePassword, hashPassword } from '../../helpers/userHelpers.js';
import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const resetPassword = async (req, res) => {
    try {

        let token = req.header('Authorization');
        const { oldPassword, newPassword } = req.body;
console.log(token , oldPassword , newPassword);

        if(!token){
            return res.status(400).send({
                success: false,
                message: "Token is missiing"
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

        if (!oldPassword || !newPassword) {
            return res.status(400).send({ 
                success: false,
                message: "All fields are required" 
            });
        }

        // Validate the token
        const userQuery = `SELECT * FROM users WHERE user_id = ? AND is_active = 1;`;
        const user = await new Promise((resolve, reject) => {
            db.query(userQuery, [user_id], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });

        if (!user) {
            return res.status(400).send({ 
                success: false,
                message: "Your data not found" 
            });
        }

        // Verify the old password
        const isMatch = await comparePassword(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({ 
                success: false,
                message: "Old password is incorrect" 
            });
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // Update the user's password and clear the reset token
        const updateQuery = `UPDATE users SET password = ? WHERE user_id = ?;`;
        await new Promise((resolve, reject) => {
            db.query(updateQuery, [hashedPassword, user_id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        res.status(200).send({ 
            success: true,
            message: "Password updated successfully" 
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
