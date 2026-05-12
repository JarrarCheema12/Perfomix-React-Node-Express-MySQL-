import db from "../../config/db.js";
import jwt from "jsonwebtoken";

export const viewLMLeaderboard = async (req, res) => {
  try {
    // Get token from headers
    const token = req.header("Authorization");
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is missing" });
    }

    // Verify token and get user id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Step 1: Verify the user is a Line Manager (role_id = 2)
    const checkUserQuery = `SELECT role_id FROM users WHERE user_id = ?`;
    const userResult = await new Promise((resolve, reject) => {
      db.query(checkUserQuery, [user_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    if (!userResult.length || userResult[0].role_id !== 2) {
      return res.status(403).json({ success: false, message: "User is not a Line Manager" });
    }

    // Step 2: Get all departments where the user is a Line Manager
    const lmDepartmentsQuery = `
      SELECT d.dept_id, d.department_name
      FROM user_departments ud
      JOIN departments d ON ud.department_id = d.dept_id
      WHERE ud.user_id = ? AND ud.is_line_manager = 1;
    `;
    const departmentsResult = await new Promise((resolve, reject) => {
      db.query(lmDepartmentsQuery, [user_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    // Log the result to verify (e.g., [ { dept_id: 1, department_name: 'Changed Name' }, ... ])
    console.log("Departments:", departmentsResult);

    // Extract department IDs
    const deptIds = departmentsResult.map((row) => row.dept_id);
    if (deptIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No departments found for this Line Manager",
        data: [],
      });
    }

    // Step 3: Get all active employees (role_id = 3) in those departments
    const getEmployeesQuery = `
      SELECT u.user_id, u.user_name, u.full_name, u.email, u.phone, u.designation, u.role_id,
             d.dept_id, d.department_name
      FROM users u
      JOIN user_departments ud ON u.user_id = ud.user_id
      JOIN departments d ON ud.department_id = d.dept_id
      WHERE u.role_id = 3 AND d.dept_id IN (?);
    `;
    const employees = await new Promise((resolve, reject) => {
      db.query(getEmployeesQuery, [deptIds], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // Step 4: For each employee, calculate performance score from evaluations
    // The query calculates the total marks_obtained for the employee based on
    // metrics assigned for that particular department.
    const departmentWiseEmployees = {};

    await Promise.all(
      employees.map(async (employee) => {
        const scoreQuery = `
          SELECT SUM(marks_obtained) AS total_score
          FROM evaluations
          WHERE employee_id = ? AND metric_id IN (
              SELECT metric_id FROM metric_assignments WHERE department_id = ?
          );
        `;
        const scoreResult = await new Promise((resolve, reject) => {
          db.query(scoreQuery, [employee.user_id, employee.dept_id], (err, results) => {
            if (err) reject(err);
            else resolve(results[0]?.total_score || 0);
          });
        });

        const employeeWithScore = {
          user_id: employee.user_id,
          user_name: employee.user_name,
          full_name: employee.full_name,
          email: employee.email,
          phone: employee.phone,
          designation: employee.designation,
          performance_score: scoreResult,
          dept_id: employee.dept_id,
          department_name: employee.department_name,
        };

        // Group employees by department
        if (!departmentWiseEmployees[employee.dept_id]) {
          departmentWiseEmployees[employee.dept_id] = {
            dept_id: employee.dept_id,
            department_name: employee.department_name,
            users: [],
          };
        }
        departmentWiseEmployees[employee.dept_id].users.push(employeeWithScore);
      })
    );

    // Step 5: For each department, sort users by performance score descending and limit to top 5
    Object.keys(departmentWiseEmployees).forEach((deptId) => {
      departmentWiseEmployees[deptId].users.sort((a, b) => b.performance_score - a.performance_score);
      departmentWiseEmployees[deptId].users = departmentWiseEmployees[deptId].users.slice(0, 5);
    });

    return res.status(200).json({
      success: true,
      message: "Leaderboard fetched successfully",
      data: Object.values(departmentWiseEmployees),
    });
  } catch (error) {
    console.error("Error fetching LM leaderboard:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
