import db from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const getLMDepartments = async (req, res) => {
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

    // Step 1: Get departments where the user is a Line Manager
    const lineManagerDepartmentsQuery = `
      SELECT d.dept_id
      FROM user_departments ud
      JOIN departments d ON ud.department_id = d.dept_id
      WHERE ud.user_id = ? AND ud.is_line_manager = 1;
    `;

    const department_ids = await new Promise((resolve, reject) => {
      db.query(lineManagerDepartmentsQuery, [user_id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    console.log(department_ids); // e.g., [ { dept_id: 1 }, { dept_id: 5 } ]

    // Step 2: Extract dept_id values from the results
    const deptIds = department_ids.map(row => row.dept_id);

    // Step 3: Use the extracted ids in the next query
    const lmDepartmentsQuery = `
      SELECT d.dept_id, d.department_id, d.department_name, COUNT(*) AS employee_count 
      FROM users u 
      JOIN user_departments ud ON u.user_id = ud.user_id
      JOIN departments d ON ud.department_id = d.dept_id 
      WHERE d.dept_id IN (?) AND u.role_id = 3 
      GROUP BY d.dept_id;
    `;

    const departments = await new Promise((resolve, reject) => {
      db.query(lmDepartmentsQuery, [deptIds], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });

    // Return the final departments data as response
    return res.status(200).json({ success: true, data: departments });

  } catch (error) {
    console.log("Error while fetching all the departments: ", error);
    return res.status(400).send({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
