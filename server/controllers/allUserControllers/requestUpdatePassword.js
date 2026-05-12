import crypto from 'crypto';
import db from '../../config/db.js';
import nodemailer from 'nodemailer';

// Controller to request password update (Forgot Password)
export const requestUpdatePassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).send({
                success: false,
                message: "Email is required"
            });
        }

        // Check if user exists
        const userQuery = `SELECT * FROM users WHERE email = ?;`;
        const user = await new Promise((resolve, reject) => {
            db.query(userQuery, [email], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        // Generate reset token and expiration
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour expiration

        // Save token in the database
        const updateQuery = `UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE user_id = ?;`;
        await new Promise((resolve, reject) => {
            db.query(updateQuery, [resetToken, resetTokenExpires, user.user_id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        // Send email with the reset link
        const resetLink = `${process.env.CLIENT_URL}/update-password?token=${resetToken}`;
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Update Your Password',
            html: `<p>Click <a href="${resetLink}">${resetLink}</a> to update your password.</p>`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).send({
            success: true,
            message: "Password update link sent to email successfully",
            reset_token: resetToken
        });
    } catch (error) {
        console.error("Error in requestUpdatePassword:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
