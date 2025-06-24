const pool = require("../config/db");

// ✅ Fetch all Teacher-Subject Links for HOD's Department
exports.getAllLinks = async (req, res) => {
  try {
    const { department_id } = req.user;

    const query = `
      SELECT 
        ts.id,
        t.name AS teacher_name,
        s.name AS subject_name,
        s.type AS subject_type,
        ts.year,
        ts.semester,
        ts.academic_year
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      WHERE s.department_id = $1
      ORDER BY ts.id DESC
    `;

    const { rows } = await pool.query(query, [department_id]);
    res.json({ success: true, links: rows });
  } catch (error) {
    console.error("Error fetching teacher-subject links:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Create a New Link (Assign Teacher to Subject + Year + Sem + Acad)
exports.createLink = async (req, res) => {
  try {
    const { teacher_id, subject_id, year, semester, academic_year } = req.body;

    const query = `
      INSERT INTO teacher_subjects (teacher_id, subject_id, year, semester, academic_year)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const { rows } = await pool.query(query, [teacher_id, subject_id, year, semester, academic_year]);
    res.status(201).json({ success: true, link: rows[0] });
  } catch (error) {
    console.error("Error creating link:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update an Existing Link (safe — doesn't allow deletion)
exports.updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacher_id, subject_id, year, semester, academic_year } = req.body;

    const query = `
      UPDATE teacher_subjects
      SET teacher_id = $1, subject_id = $2, year = $3, semester = $4, academic_year = $5
      WHERE id = $6
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      teacher_id,
      subject_id,
      year,
      semester,
      academic_year,
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Link not found" });
    }

    res.json({ success: true, updated: rows[0] });
  } catch (error) {
    console.error("Error updating link:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Fetch Subjects (for HOD's department)
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
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Fetch Teachers (for HOD's department)
exports.getTeachers = async (req, res) => {
  try {
    const { department_id } = req.user;

    const query = `
      SELECT id, name
      FROM teachers
      WHERE department_id = $1
      ORDER BY name
    `;

    const { rows } = await pool.query(query, [department_id]);
    res.json({ success: true, teachers: rows });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};