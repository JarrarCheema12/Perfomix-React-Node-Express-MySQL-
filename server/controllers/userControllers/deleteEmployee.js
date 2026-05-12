import db from '../../config/db.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

export const deleteEmployee = async (req, res) => {
    try {
        const { employee_id } = req.params;
        let token = req.header("Authorization");

        if (!token) {
            return res.status(400).send({
                success: false,
                message: "Token is missing",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).send({
                success: false,
                message: "Invalid token",
            });
        }

        if (!employee_id) {
            return res.status(400).send({
                success: false,
                message: "Employee ID is required",
            });
        }

        // Check if Employee Exists
        const checkEmployeeExist = `SELECT * FROM users WHERE user_id = ?;`;
        const employee = await new Promise((resolve, reject) => {
            db.query(checkEmployeeExist, [employee_id], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!employee) {
            return res.status(404).send({
                success: false,
                message: "Employee not found with the given ID",
            });
        }

        // Check if Admin Exists
        const checkAdminExist = `SELECT * FROM users WHERE user_id = ?;`;
        const admin = await new Promise((resolve, reject) => {
            db.query(checkAdminExist, [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });

        if (!admin) {
            return res.status(403).send({
                success: false,
                message: "Admin not found",
            });
        }

        console.log("Admin: ", admin.role_id);
        console.log("Employee: ", employee);
        

        // Ensure the requester is actually an admin
        if (admin.role_id != 1) {
            return res.status(403).send({
                success: false,
                message: "Unauthorized: Only admins can delete employees",
            });
        }

        // Delete Employee
        const deleteEmployeeQuery = `DELETE FROM users WHERE user_id = ? AND created_by = ?;`;
        const result = await new Promise((resolve, reject) => {
            db.query(deleteEmployeeQuery, [employee_id, userId], (err, results) => {
                if (err) reject(err);
                else resolve(results.affectedRows);
            });
        });

        if (result === 0) {
            return res.status(400).send({
                success: false,
                message: "Unable to delete employee",
            });
        }

        // Send Email Notification After Successful Deletion
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: employee.email,
            subject: "Account Removal Notification",
            html: `Your account has been removed from the organization by Admin <b>${admin.full_name}</b>.`,
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error("Error sending email:", emailError);
        }

        return res.status(200).send({
            success: true,
            message: "Employee deleted successfully. Notification email sent.",
        });

    } catch (error) {
        console.error("Error while deleting employee:", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
