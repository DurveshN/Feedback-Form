// src/controllers/studentLoginController.js
const pool = require("../config/db");

// // ✅ Add New Student Login
exports.addStudentLogin = async (req, res) => {
  try {
    const { department_id } = req.user; // HOD department
    const { username, password, year, semester } = req.body;

    if (!username || !password || !year || !semester) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const query = `
      INSERT INTO student_login (department_id, username, password, year, semester, used, academic_year)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [
      department_id, 
      username, 
      password, 
      year, 
      semester,
      false,
      new Date().getFullYear() + "-" + (new Date().getFullYear() + 1)
    ]);
    res.status(201).json({ success: true, student: rows[0] });

  } catch (error) {
    console.error("Error adding student login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// // ✅ Delete Student Login
exports.deleteStudentLogin = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      DELETE FROM student_login
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, message: "Student deleted successfully" });

  } catch (error) {
    console.error("Error deleting student login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
