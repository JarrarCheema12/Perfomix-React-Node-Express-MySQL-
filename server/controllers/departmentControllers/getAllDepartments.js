import db from '../../config/db.js';

export const getAllDepartments = async (req, res) => {
    try {
        const { organization_id } = req.params;

        if (!organization_id) {
            return res.status(400).send({
                success: false,
                message: "Organization ID is required"
            });
        }

        // Fetch all departments for the given organization
        const getDepartmentQuery = `
            SELECT * FROM departments WHERE organization_id = ?;
        `;

        const departments = await new Promise((resolve, reject) => {
            db.query(getDepartmentQuery, [organization_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (departments.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No departments found for this organization"
            });
        }

        // Fetch employee count for each department in parallel
        const departmentsWithCounts = await Promise.all(
            departments.map(async (dept) => {
                const countQuery = `
                    SELECT COUNT(user_id) AS count 
                    FROM user_departments 
                    WHERE department_id = ?;
                `;

                const result = await new Promise((resolve, reject) => {
                    db.query(countQuery, [dept.dept_id], (err, results) => {
                        if (err) {
                            console.log("Error while fetching employee count:", err);
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                });

                const employeeCount = result[0]?.count || 0; // Handle empty results

                // Return department with employee count
                return { ...dept, employee_count: employeeCount };
            })
        );

        return res.status(200).send({
            success: true,
            message: "Departments fetched successfully",
            departments_count: departments.length,
            departments: departmentsWithCounts
        });

    } catch (error) {
        console.error("Error while fetching all departments data:", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};