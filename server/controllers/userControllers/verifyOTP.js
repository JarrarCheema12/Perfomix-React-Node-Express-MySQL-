import jwt from 'jsonwebtoken';
import db from '../../config/db.js'; 

export const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log("OTP: ", otp);
        
        // Check if OTP is a valid 4-digit number
        if (!/^[0-9]{4}$/.test(otp)) {
            return res.status(400).send({ message: "Invalid OTP format. OTP must be a 4-digit number." });
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

        // Fetch the user by ID from the database
        const getUserQuery = `SELECT * FROM users WHERE user_id = ?;`;
        const user = await new Promise((resolve, reject) => {
            db.query(getUserQuery, [userId], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results[0]); // Resolve with the first result (if found)
            });
        });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Check if the OTP is correct and not expired
        const currentTimestamp = new Date();
        if (user.otp !== otp || new Date(user.otpExpires) < currentTimestamp) {
            return res.status(400).send({ message: "Invalid or expired OTP" });
        }

        // Update the user record to nullify OTP and otpExpires
        const updateUserQuery = `UPDATE users SET otp = 0, otp_expires = NULL WHERE user_id = ?;`;
        await new Promise((resolve, reject) => {
            db.query(updateUserQuery, [userId], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });

        // Generate a new JWT token after successful OTP verification
        const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).send({
            success: true,
            message: "OTP verified successfully. You can now access the system.",
            token: newToken, // Return the new token after OTP verification
        });

    } catch (error) {
        console.error("Error in OTP Verification: ", error);
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).send({ message: "Invalid or expired token" });
        }
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
