// src/controllers/semesterController.js
const pool = require("../config/db");

// ✅ Update Semester & Academic Year
exports.updateSemester = async (req, res) => {
  const { department_id, hod_id, new_semester, academic_year } = req.body;

  try {
    const hodCheck = await pool.query(
      "SELECT * FROM hods WHERE id = $1 AND department_id = $2",
      [hod_id, department_id]
    );

    if (hodCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const updateQuery = `
      UPDATE semester_control 
      SET current_semester = $1,
          academic_year = $2
      WHERE department_id = $3
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, [
      new_semester,
      academic_year,
      department_id
    ]);

    res.json({ success: true, semester: rows[0] });
  } catch (error) {
    console.error("Error updating semester:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Toggle Feedback Open/Close
exports.toggleFeedback = async (req, res) => {
  const { department_id, hod_id, feedback_open } = req.body;

  try {
    const hodCheck = await pool.query(
      "SELECT * FROM hods WHERE id = $1 AND department_id = $2",
      [hod_id, department_id]
    );

    if (hodCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const updateQuery = `
      UPDATE semester_control 
      SET feedback_open = $1
      WHERE department_id = $2
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, [
      feedback_open,
      department_id
    ]);

    res.json({ success: true, semester: rows[0] });
  } catch (error) {
    console.error("Error toggling feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCurrentSemesterInfo = async (req, res) => {
  try {
    const { department_id } = req.user;

    const query = `SELECT academic_year, current_semester FROM semester_control WHERE department_id = $1`;
    const { rows } = await pool.query(query, [department_id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "No semester info found." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching current semester info", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

