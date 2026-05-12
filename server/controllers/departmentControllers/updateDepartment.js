import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const updateDepartment = async (req, res) => {
    try {
        const { dept_id } = req.params;
        const { department_id, department_name, LM_of_department, performance_status } = req.body;

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

        if (!dept_id) {
            return res.status(400).send({
                success: false,
                message: "Department ID is required to update department details",
            });
        }

        // Check if the department exists
        const checkDepartmentExistQuery = `
            SELECT * FROM departments WHERE dept_id = ?;
        `;
        const department = await new Promise((resolve, reject) => {
            db.query(checkDepartmentExistQuery, [dept_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (!department) {
            return res.status(404).send({
                success: false,
                message: "Department not found",
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
                message: "You do not have permission to update this Department",
            });
        }

        // Prepare dynamic query for updating
        const updateFields = [];
        const updateValues = [];

        if (department_id) {
            updateFields.push("department_id = ?");
            updateValues.push(department_id);
        }
        if (department_name) {
            updateFields.push("department_name = ?");
            updateValues.push(department_name);
        }
        if (LM_of_department) {
            updateFields.push("LM_of_department = ?");
            updateValues.push(LM_of_department);
        }
        if (performance_status) {
            updateFields.push("performance_status = ?");
            updateValues.push(performance_status);
        }

        if (updateFields.length === 0) {
            return res.status(400).send({
                success: false,
                message: "No fields provided to update",
            });
        }

        const updateQuery = `
            UPDATE departments
            SET ${updateFields.join(", ")}
            WHERE dept_id = ?;
        `;

        updateValues.push(dept_id);

        await new Promise((resolve, reject) => {
            db.query(updateQuery, updateValues, (err, results) => {
                if (err) {
                    reject(err);
                } else if (results.affectedRows === 0) {
                    reject(new Error("No rows updated"));
                } else {
                    resolve();
                }
            });
        });

        return res.status(200).send({
            success: true,
            message: "Department updated successfully",
        });
    } catch (error) {
        console.error("Error while updating department: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
