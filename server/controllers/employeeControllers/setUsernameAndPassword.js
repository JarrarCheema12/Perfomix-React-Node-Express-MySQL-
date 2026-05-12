import { hashPassword } from '../../helpers/userHelpers.js';
import db from '../../config/db.js';

export const setCredentials = async (req, res) => {
    try {
        const { verificationToken, userName, password } = req.body;

        if (!verificationToken || !userName || !password) {
            return res.status(400).json({
                success: false,
                message: "Verification Token, Username and Password fields are required",
            });
        }

        const checkUsernameExist = `
            SELECT * FROM users WHERE user_name = ?;
        `;

        const user = await new Promise((resolve, reject) => {
            db.query(checkUsernameExist, [userName], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(user){
            return res.status(400).send({
                success: false,
                message: "User already exist with the given username"
            });
        }

        const checkUser = `
            SELECT * FROM users WHERE verification_token = ? AND user_name IS NULL AND password IS NULL;
        `

        const employee = await new Promise((resolve, reject) => {
            db.query(checkUser, [verificationToken], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!employee){
            return res.status(400).send({
                success: false,
                message: "Verification Token is not correct"
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        const updateCredentialsQuery = `
            UPDATE users SET user_name = ?, password = ?, is_active = ?, verification_token = ? WHERE verification_token = ? AND user_name IS NULL AND password IS NULL;
        `;
        await new Promise((resolve, reject) => {
            db.query(updateCredentialsQuery, [userName, hashedPassword, 1, null, verificationToken], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        return res.status(200).json({
            success: true,
            message: "Credentials set successfully",
        });
    } catch (error) {
        console.error("Error setting credentials:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
