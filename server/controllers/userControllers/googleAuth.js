import jwt from "jsonwebtoken";
import db from "../../config/db.js";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Ensure GOOGLE_CLIENT_ID is loaded
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("GOOGLE_CLIENT_ID is not defined. Check your .env file!");
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleSignIn = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: "Google token is required" });
        }

        console.log("Received Google Token:", token);

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(401).json({ success: false, message: "Invalid Google token" });
        }

        const { sub: googleId, email, name, picture } = payload;
        console.log("Google ID:", googleId);
        console.log("Email:", email);
        console.log("Name:", name);
        console.log("Profile Picture:", picture);

        // Check if user exists in the database
        let user = await new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM users WHERE google_id = ? OR email = ?", 
                [googleId, email], 
                (err, results) => {
                    if (err) {
                        console.error("Error checking user:", err);
                        return reject(err);
                    }
                    resolve(results.length > 0 ? results[0] : null);
                }
            );
        });

        if (user) {
            // Prevent login if user is not an Admin
            if (user.designation !== "Admin") {
                return res.status(403).json({
                    success: false,
                    message: "Login failed. Only Admins are allowed to sign in with Google.",
                });
            }
        } else {
            // Insert new Admin user
            const insertResult = await new Promise((resolve, reject) => {
                db.query(
                    `INSERT INTO users (full_name, email, google_id, profile_photo, role_id, is_active, is_login, designation)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        name || "Unknown", 
                        email,
                        googleId,
                        picture || "default-avatar.png", 
                        1,  // Default role_id = 1 (Admin)
                        1,  // is_active = 1
                        1,  // is_login = 1
                        "Admin"
                    ],
                    (err, results) => {
                        if (err) {
                            console.error("Error inserting user:", err);
                            return reject(err);
                        }
                        resolve({
                            user_id: results.insertId, 
                            email, 
                            full_name: name, 
                            profile_photo: picture, 
                            role_id: 1, 
                            designation: "Admin"
                        });
                    }
                );
            });

            user = insertResult;
        }

        // Check if the user has created any organization
        const anyOrganization = await new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM organizations WHERE created_by = ?",
                [user.user_id],
                (err, results) => {
                    if (err) {
                        console.error("Error checking organization:", err);
                        return reject(err);
                    }
                    resolve(results.length > 0);
                }
            );
        });

        // Generate JWT token
        const jwtToken = jwt.sign(
            { id: user.user_id, role: user.role_id }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Google Sign-In successful",
            token: jwtToken,
            user,
            anyOrganization
        });

    } catch (error) {
        console.error("Error in Google Sign-In:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

export { googleSignIn };
