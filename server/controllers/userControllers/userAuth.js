import jwt from "jsonwebtoken";
import db from "../../config/db.js";
import { comparePassword, hashPassword } from "../../helpers/userHelpers.js";
import nodemailer from "nodemailer";

const getExampleData = (req, res) => {
    console.log(process.env.DB_HOST);
    
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).json({ error: 'Database query error' });
        } else {
            res.json(results);
        }
    });
};

const registerUser = async (req, res) => {
    try {
        const { fullname, username, phone, email, password } = req.body;

        console.log("RED.BODY: ", req.body);

        // Check if user has provided all required fields
        if (!username || !email || !password || !fullname || !phone) {
            console.log('Missing required fields', username, email, password, fullname, phone);
            return res.status(400).send({ message: "All fields are required" });
        }

        // Check if 'users' table exists, create it if it doesn't
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                user_name VARCHAR(255) UNIQUE,
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255),
                profile_photo VARCHAR(255),
                role_id INT,
                designation VARCHAR(255),
                is_active TINYINT DEFAULT 1,
                otp VARCHAR(6),
                otp_expires DATETIME,
                reset_token VARCHAR(255),
                reset_token_expires DATETIME,
                verification_token VARCHAR(255),
                created_by INT,
                created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
                selected_organization_id INT DEFAULT NULL,
                is_login TINYINT DEFAULT 0,
                CONSTRAINT fk_role_id FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL
            );
        `;

        await new Promise((resolve, reject) => {
            db.query(createTableQuery, (err, results) => {
                if (err) {
                    console.error("Error creating table:", err);
                    reject(err);
                } else {
                    console.log("Checked/Created 'users' table.");
                    resolve(results);
                }
            });
        });

        // Check if user already exists
        const checkUserQuery = `SELECT * FROM users WHERE user_name = ? OR email = ?;`;

        const userExists = await new Promise((resolve, reject) => {
            db.query(checkUserQuery, [username, email], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.length > 0);
                }
            });
        });

        if (userExists) {
            console.log('User already exists with this username or email');
            return res.status(400).send({ message: "User already exists with this username or email" });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);
        console.log('Hashed Password:', hashedPassword);

        // Generate a 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const pakistanOffset = 5 * 60 * 60 * 1000;
        const otpExpires = new Date(Date.now() + 3600000 + pakistanOffset)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

        // Get profile photo path
        const profilePhotoPath = req.file ? req.file.path : null;

        const insertUserQuery = `
            INSERT INTO users (full_name, user_name, phone, email, password, profile_photo, role_id, designation, is_active, otp, otp_expires, reset_token, reset_token_expires, verification_token, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const savedUserId = await new Promise((resolve, reject) => {
            db.query(insertUserQuery, [fullname, username, phone, email, hashedPassword, profilePhotoPath, 1, "Admin", 1, otp, otpExpires, null, null, null, null, pakistanOffset], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.insertId); // Get the ID of the inserted user
                }
            });
        });

        console.log('User registered successfully');

        console.log("Saved User ID: ", savedUserId);
        

        // Generate JWT token with the user's ID
        const token = jwt.sign({ id: savedUserId }, process.env.JWT_SECRET, { expiresIn: "1d" });
        console.log('Generated Token:', token);

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true,
            port: 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Performix Email Verification',
            text: `Your OTP: ${otp}. 
It is valid for only 1 hour.
Thank you!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).send({ message: "Error sending email" });
            }
            console.log('OTP email sent:', info.response);
            return res.status(201).send({
                success: true,
                message: "User registered successfully. Please check your email for the OTP.",
                token: token
            });
        });

    } catch (error) {
        console.error("Error in Signup: ", error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ message: "Email and Password required for Login" });
        }

        // Get user details from the database
        const getUserQuery = `SELECT * FROM users WHERE (otp = 0 OR otp IS NULL) AND email = ? AND is_active = 1;`;

        const user = await new Promise((resolve, reject) => {
            db.query(getUserQuery, [email], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results.length > 0 ? results[0] : null);
            });
        });

        if (!user) {
            return res.status(400).send({
                success: false,
                message: "User not registered or you have not verified your account!",
            });
        }

        // Compare entered password with hashed password
        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(401).send({
                success: false,
                message: "Password is not correct",
            });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Update user's login status
        const setIsLoginQuery = `UPDATE users SET is_login = 1 WHERE user_id = ?;`;
        await new Promise((resolve, reject) => {
            db.query(setIsLoginQuery, [user.user_id], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results.affectedRows);
            });
        });

        // Check if the user has created any organization
        const checkOrganizationQuery = `SELECT * FROM organizations WHERE created_by = ?;`;
        const anyOrganization = await new Promise((resolve, reject) => {
            db.query(checkOrganizationQuery, [user.user_id], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results.length > 0); // Returns true if at least one organization exists
            });
        });


        // Check if the user is Admin
        const checkIsAdmin = `SELECT * FROM users WHERE user_id = ? AND role_id = 1;`;
        const isAdmin = await new Promise((resolve, reject) => {
            db.query(checkIsAdmin, [user.user_id], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results.length > 0); // Returns true if at least one organization exists
            });
        });   

        // Check if the user is Admin
        const checkIsManager = `SELECT * FROM users WHERE user_id = ? AND role_id = 2;`;
        const isManager = await new Promise((resolve, reject) => {
            db.query(checkIsManager, [user.user_id], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results.length > 0); // Returns true if at least one organization exists
            });
        });   


        // Check if the user is Admin
        const checkIsStaff = `SELECT * FROM users WHERE user_id = ? AND role_id = 3;`;
        const isStaff = await new Promise((resolve, reject) => {
            db.query(checkIsStaff, [user.user_id], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results.length > 0); // Returns true if at least one organization exists
            });
        });   


        return res.status(200).send({
            success: true,
            message: "User Logged In Successfully",
            token: token,
            users_data: user,
            anyOrganization: anyOrganization, // true if user has an organization, false otherwise
            isAdmin: isAdmin,
            isManager: isManager,
            isStaff: isStaff,
            userId: user.user_id

        });

    } catch (error) {
        console.error("Error in Login User:", error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export default loginUser;



const logoutUser = async (req, res) => {
    try {
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

        const setLogoutQuery = `UPDATE users SET is_login = 0 WHERE user_id = ?;`;

        const result = await new Promise((resolve, reject) => {
            db.query(setLogoutQuery, [userId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.affectedRows);
                }
            });
        });

        // if (result === 0) {
        //     return res.status(400).send({
        //         success: false,
        //         message: "User logout failed",
        //     });
        // }

        return res.status(200).send({
            success: true,
            message: "User logged out successfully",
        });

    } catch (error) {
        console.log("Error in Logout User: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};




export {getExampleData, registerUser, loginUser, logoutUser}
