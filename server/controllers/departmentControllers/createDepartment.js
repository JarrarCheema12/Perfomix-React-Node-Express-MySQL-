import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const createDepartment = async (req , res) => {

    try {
        
        const { department_id, department_name, organization_id } = req.body;
        
        // Check if the Authorization header exists
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({ message: "Authorization token is required" });
        }

        if(!department_id || !department_name || !organization_id){
            return res.status(400).send({
                success: false,
                message: "All fields are required"
            });
        }

        // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        if (!userId) {
            return res.status(401).send({ message: "Invalid token" });
        }


        // Check if created user is Admin or not
        const checkifAdmin = `
            SELECT * FROM users WHERE user_id = ? AND (created_by IS NULL OR created_by = 0);
        `

        const admin = await new Promise((resolve, reject) => {
            db.query(checkifAdmin, [userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!admin){
            return res.status(400).send({
                success: false,
                message: "Only Admin user can create Department"
            });
        }
        


        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS departments (
                dept_id INT AUTO_INCREMENT PRIMARY KEY,
                department_id VARCHAR(20),
                department_name VARCHAR(255),
                created_by INT,
                created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active TINYINT DEFAULT 1,
                organization_id INT,
                CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) ON DELETE SET NULL
            );
        `;


        await new Promise((resolve, reject) => {
            db.query(createTableQuery, (err, results) => {
                if(err){
                    console.error("Error creating table:", err);
                    reject(err);
                }
                else{
                    console.log("Checked/Created 'departments' table.");
                    resolve(results);
                }
            });
        });


        // CHECK ORGANIZATION EXIST WITH THE GIVEN ID
        const checkOrganizationQuery = `
            SELECT * FROM organizations WHERE organization_id = ? AND created_by = ?;
        `;

        const organization = await new Promise((resolve , reject) => {
            db.query(checkOrganizationQuery, [organization_id, userId], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!organization){
            return res.status(401).send({
                success: false,
                message: "No Organization Exist with this id made by you"
            });
        }


        // CHECK USER EXIST WITH THE GIVEN LM ID
        // const checkUserQuery = `
        //     SELECT * FROM users WHERE user_id = ?;
        // `;

        // const user = await new Promise((resolve , reject) => {
        //     db.query(checkUserQuery, [LM_of_department], (err, results) => {
        //         if(err){
        //             reject(err);
        //         }
        //         else{
        //             resolve(results[0]);
        //         }
        //     });
        // });

        // if(!user){
        //     return res.status(401).send({
        //         success: false,
        //         message: "User ID is not correct. No user Exist with this ID"
        //     });
        // }



        const checkDepartmentExist = `
            SELECT * FROM departments WHERE department_id = ? OR department_name = ?;
        `;

        const department = await new Promise((resolve, reject) => {
            db.query(checkDepartmentExist, [department_id, department_name], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(department){
            return res.status(400).send({
                success: false,
                message: "Department with same Department_Id or Department_Name already exist"
            });
        }

        // Get the current timestamp and adjust for Pakistan time (GMT+5)
        const currentTimestamp = new Date();
        currentTimestamp.setHours(currentTimestamp.getHours() + 5); // Add 5 hours to GMT

        // Format the adjusted date to 'YYYY-MM-DD HH:mm:ss'
        const pakistanTime = currentTimestamp.toISOString().slice(0, 19).replace('T', ' ');

        const insertDepartmentQuery = `
            INSERT INTO departments (department_id, department_name, created_by, created_on, is_active, organization_id)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

        const result = await new Promise((resolve, reject) => {
            db.query(insertDepartmentQuery, [department_id, department_name, userId, pakistanTime, 1, organization_id], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });

        // Check if the row was inserted
        if (result.affectedRows === 1) {
            const insertedDepartmentId = result.insertId;

            // Fetch the inserted department
            const fetchDepartmentQuery = `
                SELECT * FROM departments WHERE dept_id = ?;
            `;
            const department = await new Promise((resolve, reject) => {
                db.query(fetchDepartmentQuery, [insertedDepartmentId], (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results[0]);
                });
            });


            const createQuery = `
                CREATE TABLE IF NOT EXISTS user_departments (
                    user_id INT,
                    department_id INT,
                    is_line_manager TINYINT DEFAULT 0,
                    PRIMARY KEY (user_id, department_id),
                    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    CONSTRAINT fk_department_id FOREIGN KEY (department_id) REFERENCES departments(dept_id) ON DELETE CASCADE
                );
            `;


            await new Promise((resolve, reject) => {
                db.query(createQuery, (err, results) => {
                    if(err){
                        console.error("Error creating table:", err);
                        reject(err);
                    }
                    else{
                        console.log("Checked/Created 'user_departments' table.");
                        resolve(results);
                    }
                });
            });



            const insertedUserDepartmentsData = `
                INSERT INTO user_departments(user_id, department_id, is_line_manager)
                VALUES (?, ?, ?);
            `;

            await new Promise((resolve, reject) => {
                db.query(insertedUserDepartmentsData, [userId, insertedDepartmentId, 0], (err, results) => {
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(results);
                    }
                });
            });

            return res.status(201).send({
                success: true,
                message: "Department created successfully",
                department: department
            });
        }
        
    } catch (error) {
        console.log("Error while creating department: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}