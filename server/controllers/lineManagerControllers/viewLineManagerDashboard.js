import db from "../../config/db.js";
import jwt from "jsonwebtoken";

export const viewLineManagerDashboard = async (req, res) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Step 1: Get departments where the user is a Line Manager (using is_line_manager flag)
    const lineManagerDepartmentsQuery = `
      SELECT d.dept_id, d.department_name 
      FROM user_departments ud
      JOIN departments d ON ud.department_id = d.dept_id
      WHERE ud.user_id = ? AND ud.is_line_manager = 1;
    `;
    const lineManagerDepartments = await new Promise((resolve, reject) => {
      db.query(lineManagerDepartmentsQuery, [user_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (lineManagerDepartments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No departments found for this Line Manager",
        data: {
          total_departments: 0,
          total_employees: 0,
          pending_evaluations: 0,
          performance_data: [],
          employees_data: []
        }
      });
    }

    const departmentIds = lineManagerDepartments.map(dep => dep.dept_id);

    // Step 2: Get total employees (role_id = 3) in these departments
    const totalEmployeesQuery = `
      SELECT COUNT(DISTINCT u.user_id) AS total_employees
      FROM users u
      JOIN user_departments ud ON u.user_id = ud.user_id
      WHERE ud.department_id IN (?) AND u.role_id = 3;
    `;
    const totalEmployees = await new Promise((resolve, reject) => {
      db.query(totalEmployeesQuery, [departmentIds], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]?.total_employees || 0);
      });
    });

    

    // Step 3: Count employees with pending evaluations.
    // For each employee in the managed departments, we count the total assigned metric parameters
    // (via metric_assignments and metric_parameters) and the evaluated parameters (from evaluations).
    // An employee is pending if evaluated_params < total_params.
    const pendingEvaluationsQuery = `
      SELECT COUNT(*) AS pending_evaluations
      FROM (
        SELECT u.user_id,
               COUNT(mp.parameter_id) AS total_params,
               COUNT(e.parameter_id) AS evaluated_params
        FROM users u
        JOIN user_departments ud ON u.user_id = ud.user_id
        JOIN departments d ON ud.department_id = d.dept_id
        JOIN metric_assignments ma ON d.dept_id = ma.department_id AND ma.line_manager_id = ?
        JOIN metric_parameters mp ON ma.metric_id = mp.metric_id
        LEFT JOIN evaluations e ON u.user_id = e.employee_id AND mp.parameter_id = e.parameter_id
        WHERE ud.department_id IN (?) AND u.role_id = 3
        GROUP BY u.user_id
        HAVING evaluated_params < total_params
      ) AS pending;
    `;
    const pendingEvaluations = await new Promise((resolve, reject) => {
      db.query(pendingEvaluationsQuery, [user_id, departmentIds], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]?.pending_evaluations || 0);
      });
    });

    // Step 4: Get total performance scores per department (sum of marks_obtained from evaluations)
    const departmentScoresQuery = `
      SELECT 
          d.dept_id, 
          d.department_name, 
          COALESCE(SUM(e.marks_obtained), 0) AS total_performance_score
      FROM departments d
      LEFT JOIN user_departments ud ON d.dept_id = ud.department_id
      LEFT JOIN users u ON ud.user_id = u.user_id AND u.role_id = 3
      LEFT JOIN evaluations e ON u.user_id = e.employee_id
      WHERE d.dept_id IN (?)
      GROUP BY d.dept_id, d.department_name;
    `;
    const departmentScores = await new Promise((resolve, reject) => {
      db.query(departmentScoresQuery, [departmentIds], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // Step 5: Get details of all employees (role_id = 3) along with their performance scores
    const employeesDataQuery = `
      SELECT 
          u.user_id, 
          u.full_name, 
          u.email, 
          u.role_id, 
          u.is_login, 
          d.dept_id, 
          d.department_name, 
          COALESCE(SUM(e.marks_obtained), 0) AS performance_score
      FROM users u
      JOIN user_departments ud ON u.user_id = ud.user_id
      JOIN departments d ON ud.department_id = d.dept_id
      LEFT JOIN evaluations e ON u.user_id = e.employee_id
      WHERE d.dept_id IN (?) AND u.role_id = 3
      GROUP BY u.user_id, d.dept_id, d.department_name, u.full_name, u.email, u.role_id, u.is_login
      ORDER BY d.department_name, u.full_name;
    `;
    const employeesData = await new Promise((resolve, reject) => {
      db.query(employeesDataQuery, [departmentIds], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    return res.status(200).json({
      success: true,
      message: "Line Manager dashboard data fetched successfully",
      data: {
        total_departments: lineManagerDepartments.length,
        total_employees: totalEmployees,
        pending_evaluations: pendingEvaluations,
        performance_data: departmentScores,
        employees_data: employeesData
      }
    });
  } catch (error) {
    console.error("Error fetching Line Manager dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
