// src/controllers/studentLoginController.js
const pool = require("../config/db");

// ✅ Add New Student Login
exports.addStudentLogin = async (req, res) => {
  try {
    const { department_id } = req.user; // HOD department
    const { username, password, year } = req.body;

    if (!username || !password || !year) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const query = `
      INSERT INTO student_login (department_id, username, password, year)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [department_id, username, password, year]);
    res.status(201).json({ success: true, student: rows[0] });

  } catch (error) {
    console.error("Error adding student login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ List All Students of Department
exports.listStudentLogins = async (req, res) => {
  try {
    const { department_id } = req.user;

    const query = `
      SELECT id, username, password, year
      FROM student_login
      WHERE department_id = $1
      ORDER BY year ASC, username ASC
    `;
    const { rows } = await pool.query(query, [department_id]);
    res.json({ success: true, students: rows });

  } catch (error) {
    console.error("Error listing student logins:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update Student Login
exports.updateStudentLogin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, year } = req.body;

    const query = `
      UPDATE student_login
      SET username = $1, password = $2, year = $3
      WHERE id = $4
      RETURNING *
    `;
    const { rows } = await pool.query(query, [username, password, year, id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, student: rows[0] });

  } catch (error) {
    console.error("Error updating student login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Delete Student Login
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
