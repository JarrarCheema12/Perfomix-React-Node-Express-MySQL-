import db from "../../config/db.js";
import jwt from "jsonwebtoken";

export const viewStaffLeaderboard = async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const checkIfStaff = `
        SELECT * FROM users WHERE user_id = ? AND is_active = 1 AND role_id = 3;
    `;

    const user = await new Promise((resolve, reject) => {
      db.query(checkIfStaff, [user_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!user.length) {
      return res.status(400).send({
        success: false,
        message: "Requested User data not found. Only Staff can access the Staff's Leaderboard"
      });
    }

    const staffDepartmentQuery = `
      SELECT d.dept_id, d.department_name
      FROM user_departments ud
      JOIN departments d ON ud.department_id = d.dept_id
      WHERE ud.user_id = ?;
    `;

    const departmentResult = await new Promise((resolve, reject) => {
      db.query(staffDepartmentQuery, [user_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!departmentResult.length) {
      return res.status(200).json({
        success: true,
        message: "No department found for this staff member",
        data: [],
      });
    }

    const { dept_id, department_name } = departmentResult[0];

    const getEmployeesQuery = `
      SELECT u.user_id, u.user_name, u.full_name, u.email, u.phone, u.designation, u.role_id
      FROM users u
      JOIN user_departments ud ON u.user_id = ud.user_id
      WHERE u.role_id = 3 AND ud.department_id = ? AND u.user_id != ?;
    `;

    const employees = await new Promise((resolve, reject) => {
      db.query(getEmployeesQuery, [dept_id, user_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    let departmentLeaderboard = [];

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
          db.query(scoreQuery, [employee.user_id, dept_id], (err, results) => {
            if (err) reject(err);
            else resolve(results[0]);
          });
        });

        const totalScore = scoreResult.total_score || 0;

        departmentLeaderboard.push({
          user_id: employee.user_id,
          user_name: employee.user_name,
          full_name: employee.full_name,
          email: employee.email,
          phone: employee.phone,
          designation: employee.designation,
          performance_score: totalScore,
        });
      })
    );

    departmentLeaderboard.sort((a, b) => b.performance_score - a.performance_score);

    return res.status(200).json({
      success: true,
      message: "Staff leaderboard fetched successfully",
      department: {
        dept_id,
        department_name,
        leaderboard: departmentLeaderboard,
      },
    });
  } catch (error) {
    console.error("Error fetching staff leaderboard:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
