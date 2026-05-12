import jwt from "jsonwebtoken";
import db from "../config/db.js"

export const verifyToken = async (req, res, next) => {
    console.log("Verifying Token...");
    
    try {
        let token = req.header("Authorization");

        console.log("Token: ", token);
        
        if (!token) {  
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access. Token is missing"
            });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
            // const user = await User.findById(decoded.id);
            // if (!user) {
            //     return res.status(401).json({ success: false, message: "Unauthorized Access" });
            // }
            // req.userId = decoded.id;
            // req.user = user;

            console.log("Decoded_ID: ", userId);
            

            const getUserQuery = `SELECT * FROM users WHERE user_id = ?;`

            const user = await new Promise((resolve, reject) => {
                console.log("Running SQL Query: ", getUserQuery, userId);
                db.query(getUserQuery, [userId], (err, results) => {
                    if(err){
                        console.error("DB Error: ", err);
                        return reject(err);
                    }
                    console.log("DB Query Results: ", results); // Log query results
                    if (results.length > 0) {
                        resolve(results[0]);
                    } else {
                        resolve(null); // No user found
                    }

                });
            });

            if(!user){
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized Access"
                });
            }
            
            console.log("User: ", user);
            

            next();
            
        } catch (error) {
            if (error.message === "jwt expired") {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized. Token expired.",
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized Access! Invalid token.",
                });
            }
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }
}