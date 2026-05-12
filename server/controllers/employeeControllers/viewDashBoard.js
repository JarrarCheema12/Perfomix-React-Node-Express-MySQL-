import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const viewDashboard = async(req , res) => {

    try {
        
        const token = req.header('Authorization');

         if(!token){
            return res.status(400).send({
                success: false,                    
                message: "Token is missiing"
            });                
        }
        
        // Verify the token and extract the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;
        
        if(!user_id) {
            return res.status(401).send({ 
                success: false,
                message: "Invalid token" 
            });
        }

        // const checkIfUserExist = `
        //     SELECT * FROM users WHERE user_id = ? AND is_active = 1;
        // `;

        // const user = await new Promise((resolve, reject) => {
        //     db.query(checkIfUserExist, [user_id], (err, results) => {
        //         if(err){
        //             reject(err);
        //         }
        //         else{
        //             resolve(results[0]);
        //         }
        //     });
        // });


        // if(!user){
        //     return res.status(400).send({
        //         success: false,
        //         message: "Requested User not found"
        //     });
        // }


        const getUserDepartmentAndOrganization = `
            SELECT u.user_id, u.user_name, u.full_name, d.dept_id, d.department_id, d.department_name, 
            o.organization_id, o.organization_Name FROM users u JOIN user_departments ud ON u.user_id = ud.user_id 
            JOIN departments d ON ud.department_id = d.dept_id 
            JOIN organizations o ON d.organization_id = o.organization_id WHERE u.user_id = ?;
        `;

        const organizationAndDepartmentData = await new Promise((resolve, reject) => {
            db.query(getUserDepartmentAndOrganization, [user_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!organizationAndDepartmentData){
            return res.status(400).send({
                success: false,
                message: "Data not found"
            });
        }

        
        const getEmployeeCount = `
            SELECT COUNT(user_id) AS Employee_Count FROM user_departments WHERE department_id = ? GROUP BY department_id;
        `;

        const employeeCount = await new Promise((resolve, reject) => {
            db.query(getEmployeeCount, [organizationAndDepartmentData.dept_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });


        // Get Departments Count
        const getDepartmentCount = `
            SELECT COUNT(*) AS Department_Count FROM departments WHERE organization_id = ? AND is_active = 1;
        `

        const departmentCount = await new Promise((resolve, reject) => {
            db.query(getDepartmentCount, [organizationAndDepartmentData.organization_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });



        
        const getMetricAssignment = `
            SELECT * FROM metric_assignments WHERE department_id = ?;
        `;

        const metricAssignmentData = await new Promise((resolve, reject) => {
            db.query(getMetricAssignment, [organizationAndDepartmentData.dept_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });

        if(!metricAssignmentData){
            console.log("Metric Assignment Data not Found with the Department_Id: ", organizationAndDepartmentData.dept_id);
        }

        
        const getLMTopPerformer = `
            SELECT metric_id, parameter_id, line_manager_id, MAX(marks_obtained) AS Marks FROM line_manager_evaluations WHERE metric_id = ?;
        `;

        const getStaffTopPerformer = `
            SELECT metric_id, parameter_id, employee_id, MAX(marks_obtained) AS Marks FROM evaluations WHERE metric_id = ?;
        `;


        const LMTopPerformer = await new Promise((resolve, reject) => {
            db.query(getLMTopPerformer, [metricAssignmentData.metric_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });


        const staffTopPerformer = await new Promise((resolve, reject) => {
            db.query(getStaffTopPerformer, [metricAssignmentData.metric_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });


        // Now Fetch Name and Username of the Top Performer

        const getLineManager = `
            SELECT * FROM users WHERE user_id = ?;
        `;

        const getStaff = `
            SELECT * FROM users WHERE user_id = ?;
        `;


        const lineManager = await new Promise((resolve, reject) => {
            db.query(getLineManager, [LMTopPerformer.line_manager_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });


        const staff = await new Promise((resolve, reject) => {
            db.query(getStaff, [staffTopPerformer.employee_id], (err, results) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(results[0]);
                }
            });
        });


        if(!lineManager){
            console.log("Line Manager not found");            
        }

        if(!staff){
            console.log("Staff not found");            
        }


        return res.status(200).send({
            success: true,
            message: "Dashboard Data fetched successfully",
            organization_department_data: organizationAndDepartmentData,
            total_departments: departmentCount.Department_Count,
            total_employees: employeeCount.Employee_Count,
            top_performer_in_LM: {
                user_id: lineManager.user_id,
                user_name: lineManager.user_name,
                full_name: lineManager.full_name,
                email: lineManager.email,
                phone: lineManager.phone,
                designation: lineManager.designation
            },
            top_performer_in_staff: {
                user_id: staff.user_id,
                user_name: staff.user_name,
                full_name: staff.full_name,
                email: staff.email,
                phone: staff.phone,
                designation: staff.designation
            }
        });


    } catch (error) {
        console.error("Error fetching Dashboard information:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
        });
    }

}