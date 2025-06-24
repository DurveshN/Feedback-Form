const pool = require("../config/db");

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM teachers");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a new teacher
exports.addTeacher = async (req, res) => {
  try {
    const { name, department_id } = req.body;
    if (!name || !department_id) {
      return res.status(400).json({ error: "Name and department ID are required" });
    }
    const result = await pool.query(
      "INSERT INTO teachers (name, department_id) VALUES ($1, $2) RETURNING *",
      [name, department_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding teacher:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
