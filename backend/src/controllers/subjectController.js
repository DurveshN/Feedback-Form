const pool = require("../config/db");

exports.getSubjects = async (req, res) => {
  try {
    const { department_id } = req.user;

    const query = `
      SELECT id, name, type
      FROM subjects
      WHERE department_id = $1
      ORDER BY name
    `;
    const { rows } = await pool.query(query, [department_id]);

    res.json({ success: true, subjects: rows });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.addSubject = async (req, res) => {
  try {
    const { department_id } = req.user;
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: "Subject name and type are required" });
    }

    if (!['theory', 'practical'].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid subject type. Must be 'theory' or 'practical'" });
    }

    const query = `
      INSERT INTO subjects (name, department_id, type)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [name.trim(), department_id, type]);

    res.status(201).json({ success: true, subject: rows[0] });
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      return res.status(400).json({ success: false, message: "Subject name already exists in this department" });
    }
    if (err.code === '23514') { // Check constraint violation
      return res.status(400).json({ success: false, message: "Invalid subject type" });
    }
    console.error("Error adding subject:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};