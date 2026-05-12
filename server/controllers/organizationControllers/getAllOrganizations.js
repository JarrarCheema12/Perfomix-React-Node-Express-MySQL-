import db from "../../config/db.js";
import jwt from 'jsonwebtoken';

export const getAllOrganizations = async (req, res) => {

    try {

        // Check if the Authorization header exists
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).send({ 
                success: false,
                message: "Authorization token is required" 
            });
        }

        // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;

        if (!user_id) {
            return res.status(401).send({ 
                success: false,
                message: "Invalid token" 
            });
        }

        const checkIfAdmin = `
            SELECT * FROM users WHERE user_id = ? AND created_by IS NULL OR created_by = 0 AND is_active = 1;
        `;

        const admin = await new Promise((resolve, reject) => {
            db.query(checkIfAdmin, [user_id], (err, results) => {
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
                message: "You are not an Admin"
            })
        }

        const getOrganizationsQuery = `SELECT * FROM organizations WHERE created_by = ?;`;

        let organizations = await new Promise((resolve, reject) => {
            db.query(getOrganizationsQuery, [user_id], (err, results) => {
                if(err){
                    console.log("Cannot able to get the Organization");
                    reject(err);
                }
                else{
                    console.log("Successfully get the Organization");
                    resolve(results);
                }
            });
        });


        // let deptIds = [];

        // for (let index = 0; index < organizations.length; index++) {
        //     console.log(organizations[index].organization_id); 
        //     const getAllDepartments = `
        //         SELECT dept_id FROM departments WHERE organization_id = ?
        //     `;
        
        //     const deptData = await new Promise((resolve, reject) => {
        //         db.query(getAllDepartments, [organizations[index].organization_id], (err, results) => {
        //             if(err){
        //                 console.log("Error while fetching department Id");
        //                 reject(err);
        //             } else {
        //                 resolve(results);
        //             }
        //         });
        //     });
        
        //     for (let index = 0; index < deptData.length; index++) {
        //         const element = deptData[index];
        //         deptIds.push(element);
        //     }
            
        // }

        // // console.log("DEPT IDS: ", deptIds);
        
        // let employeeCount = 0;
        // for (let index = 0; index < deptIds.length; index++) {
        //     const deptId = deptIds[index].dept_id;
            
        //     const getEmployeCount = `
        //         SELECT COUNT(user_id) AS count FROM user_departments WHERE department_id = ?;
        //     `;

        //     const result = await new Promise((resolve, reject) => {
        //         db.query(getEmployeCount, [deptId], (err, results) => {
        //             if(err){
        //                 reject(err);
        //             }
        //             else{
        //                 resolve(results)
        //             }
        //         });
        //     });

        //     employeeCount = employeeCount + result[0].count;

        //     // console.log("COUNT: ", result[0].count);
            
        // }

        // console.log("Total Employees: ", employeeCount);
        
        

        // Fetch departments and employee counts for each organization in parallel
        organizations = await Promise.all(
            organizations.map(async (org) => {
                // Fetch department IDs for the organization
                const getAllDepartments = `SELECT dept_id FROM departments WHERE organization_id = ?`;
                
                const deptData = await new Promise((resolve, reject) => {
                    db.query(getAllDepartments, [org.organization_id], (err, results) => {
                        if (err) {
                            console.log("Error while fetching department Ids");
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    });
                });

                const deptIds = deptData.map(dept => dept.dept_id); // Extract dept_id values
                
                // Fetch employee count for all departments in this organization
                let employeeCount = 0;
                
                if (deptIds.length > 0) {
                    const getEmployeeCount = `
                        SELECT COUNT(user_id) AS count 
                        FROM user_departments 
                        WHERE department_id IN (?);
                    `;

                    const result = await new Promise((resolve, reject) => {
                        db.query(getEmployeeCount, [deptIds], (err, results) => {
                            if (err) {
                                console.log("Error while fetching employee count");
                                reject(err);
                            } else {
                                resolve(results);
                            }
                        });
                    });

                    employeeCount = result[0]?.count || 0; // Set count or 0 if no employees found
                }

                // Attach employee count to the organization object
                return { ...org, employee_count: employeeCount };
            })
        );

        console.log("Organizations with Employee Count: ", organizations);

        
        

        return res.status(200).send({
            success: true,
            message: "Organization fetched successfuly",
            total_organizations: organizations.length,
            organizations: organizations
        });

    } catch (error) {
        console.log("Error while fetching single organization: ", error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error"
        });
    }

}