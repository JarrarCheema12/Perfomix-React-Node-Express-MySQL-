import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const deleteDepartment = async (req , res) => {

    try {
        
        const {dept_id} = req.params;

        if(!dept_id){
            return res.status(400).send({
                success: false,
                message: "Department Id is required"
            });
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


        // Check if department exist
        const checkDepartmentExist = `
            SELECT * FROM departments WHERE dept_id = ?;
        `;
        const departmentExist = await new Promise((resolve, reject) => {
            db.query(checkDepartmentExist, [dept_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (!departmentExist) {
            return res.status(404).send({
                success: false,
                message: "There is no such Department Exist in the Database",
            });
        }


        // Check if the department is created by the user
        const checkDepartmentCreatedUser = `
            SELECT * FROM departments WHERE dept_id = ? AND created_by = ?;
        `;
        const dept = await new Promise((resolve, reject) => {
            db.query(checkDepartmentCreatedUser, [dept_id, userId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (!dept) {
            return res.status(404).send({
                success: false,
                message: "You do not have permission to delete this Department",
            });
        }

        const deleteDepartmentQuery = `
            DELETE FROM departments WHERE dept_id = ?;
        `;

        await new Promise((resolve, reject) => {
            db.query(deleteDepartmentQuery, [dept_id], (err, results) => {
                if (err) {
                    reject(err);
                } else if (results.affectedRows === 0) {
                    reject(new Error("No row deleted"));
                } else {
                    resolve();
                }
            });
        });

        return res.status(200).send({
            success: true,
            message: "Department deleted successfully"
        });

    } catch (error) {
        console.log("Error while deleting department", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}