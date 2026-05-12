import crypto from 'crypto';
import nodemailer from 'nodemailer';
import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const addEmployee = async (req, res) => {
    try {
            const { full_name, email, phone, department_id, role_id, designation} = req.body;
            const token = req.header('Authorization');
            

            if (!full_name || !email || !phone || !department_id || !role_id, !designation) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required",
                });
            }

            if (isNaN(parseInt(role_id)) || parseInt(role_id) < 2 || parseInt(role_id) > 3) {
                return res.status(400).send({
                    success: false,
                    message: "Incorrect Role ID"
                });
            }

            if(role_id === '2' && designation !== 'Line Manager'){
                return res.status(400).send({
                    success: false,
                    message: "Role-Id [2] must only be assign to Line Manager"
                });
            }
            

            if(!token){
                return res.status(400).send({
                    success: false,
                    message: "Token is missiing"
                });
            }

            // Verify the token and extract the user ID
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const admin_id = decoded.id;

            if (!admin_id) {
                return res.status(401).send({ 
                    success: false,
                    message: "Invalid token" 
                });
            }


            const checkDepartmentExist = `
                SELECT * FROM departments WHERE dept_id = ?;
            `;

            const department = await new Promise((resolve, reject) => {
                db.query(checkDepartmentExist, [department_id], (err, results) => {
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(results[0]);
                    }
                });
            });

            // console.log("Department: ", department);
            

            if(!department){
                return res.status(400).send({
                    success: false,
                    message: "No department Exist with this Department ID"
                });
            }

            // Created_by IS NULL means is that, that user is admin user who has not been created by anyone
            const checkIfAdmin = `
                SELECT * FROM users WHERE user_id = ? AND created_by IS NULL;
            `;

            const admin = await new Promise((resolve, reject) => {
                db.query(checkIfAdmin, [admin_id], (err, results) => {
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(results[0]);
                    }
                });
            });

            console.log("Admin User: ", admin);
            
            if(!admin){
                return res.status(400).send({
                    success: false,
                    message: "You are not authorized to add Employee as your are not an Admin"
                })
            }


            // Generate a unique verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');

            const insertUserQuery = `
                INSERT INTO users (full_name, email, phone, role_id, designation, verification_token, created_by, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `;

            const userId = await new Promise((resolve, reject) => {
                db.query(insertUserQuery, [full_name, email, phone, role_id, designation, verificationToken, admin_id, 0], (err, result) => {
                    if (err) return reject(err);
                    resolve(result.insertId); // Get the user_id of the inserted user
                });
            });

            // console.log("Insert User ID: ", userId);
            

            // Insert in Users Departments Table
            const insertUserDepartmentQuery = `
                INSERT INTO user_departments (user_id, department_id)
                VALUES (?, ?);
            `;
            await new Promise((resolve, reject) => {
                db.query(insertUserDepartmentQuery, [userId, department_id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            if(role_id === '2' || role_id === 2 || role_id == 2){
                const assignLMToDepartment = `
                    UPDATE user_departments SET is_line_manager = 1 WHERE user_id = ? AND department_id = ?;
                `;

                const result = await new Promise((resolve, reject) => {
                    db.query(assignLMToDepartment, [userId, department_id], (err, results) => {
                        if(err){
                            reject(err);
                        }
                        else{
                            resolve(results.affectedRows);
                        }
                    });
                });

                if(result < 1){
                    console.log("Created Line Manager cannot be able to set in the Departments Table");
                }
            }

            // Send verification email
            const verificationLink = `http://localhost:5173/employee-name-pass`;
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Email Verification",
                html: `Welcome to Performix! <br>Your Verification Code: <b>${verificationToken}</b> <br>Link to set your username and password: ${verificationLink}`,
            };            

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error("Error sending email:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Error sending verification email",
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "User added successfully. Verification email sent.",
                });
            });
        } catch (error) {
            console.error("Error adding user:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
};
