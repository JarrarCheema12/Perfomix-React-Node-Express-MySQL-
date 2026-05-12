import db from '../../config/db.js';

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required",
            });
        }

        console.log('Token: ', token);
        

        const verifyQuery = `
            SELECT * FROM users WHERE verification_token = ? AND is_active = 0;
        `;
        const user = await new Promise((resolve, reject) => {
            db.query(verifyQuery, [token], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        // Activate user and clear token
        const activateQuery = `
            UPDATE users SET is_active = 1, verification_token = NULL WHERE user_id = ?;
        `;

        console.log("USER-ID: ", user.user_id);
        
        await new Promise((resolve, reject) => {
            db.query(activateQuery, [user.user_id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        return res.status(201).send({
            success: true,
            message: "You are now activated. Please set your username and password now"
        });

        // return res.redirect(`${process.env.CLIENT_URL}/set-credentials?userId=${user.user_id}`);
    } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
