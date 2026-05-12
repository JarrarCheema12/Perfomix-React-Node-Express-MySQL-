import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import db from "./db.js"; // Import database connection

dotenv.config();

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const fullName = profile.displayName;
            const googleId = profile.id;
            
            // Check if user already exists
            const checkUserQuery = "SELECT * FROM users WHERE email = ?";
            const existingUser = await new Promise((resolve, reject) => {
                db.query(checkUserQuery, [email], (err, results) => {
                    if (err) reject(err);
                    resolve(results.length > 0 ? results[0] : null);
                });
            });

            if (existingUser) {
                return done(null, existingUser);
            }

            // Register the user if they don't exist
            const insertUserQuery = `
                INSERT INTO users (full_name, email, user_name, is_active, is_login) 
                VALUES (?, ?, ?, ?, ?);
            `;
            const newUser = await new Promise((resolve, reject) => {
                db.query(insertUserQuery, [fullName, email, googleId, 1, 1], (err, results) => {
                    if (err) reject(err);
                    resolve({ user_id: results.insertId, full_name: fullName, email });
                });
            });

            return done(null, newUser);
        } catch (error) {
            return done(error, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser((id, done) => {
    db.query("SELECT * FROM users WHERE user_id = ?", [id], (err, results) => {
        if (err) return done(err);
        done(null, results[0]);
    });
});

export default passport;
