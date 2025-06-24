const pool = require("../config/db");

// ✅ Get Average Rating per Question for a Specific Teacher-Subject
exports.getTeacherSubjectGraph = async (req, res) => {
  try {
    const { teacher_subject_id, academic_year, student_year, semester } = req.query;

    const query = `
      SELECT 
        q.text AS question_text,
        ROUND(AVG(f.rating)::numeric, 2) AS average_rating
      FROM feedback f
      JOIN questions q ON f.question_id = q.id
      JOIN teacher_subjects ts ON f.teacher_subject_id = ts.id
      WHERE f.teacher_subject_id = $1
        AND f.academic_year = $2
        AND ts.year = $3
        AND f.semester = $4
        AND q.type != 'text-answer'
      GROUP BY q.text
      ORDER BY q.text;
    `;

    const { rows } = await pool.query(query, [teacher_subject_id, academic_year, student_year, semester]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching teacher-subject graph data:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// Feedback Count for Subject (for Teacher)
exports.getTeacherSubjectFeedbackCount = async (req, res) => {
  try {
    const { teacher_subject_id, academic_year, student_year, semester } = req.query;

    const query = `
      SELECT COUNT(DISTINCT submission_id) AS feedback_count
      FROM feedback f
      JOIN teacher_subjects ts ON f.teacher_subject_id = ts.id
      WHERE f.teacher_subject_id = $1
        AND f.academic_year = $2
        AND ts.year = $3
        AND f.semester = $4;
    `;

    const { rows } = await pool.query(query, [teacher_subject_id, academic_year, student_year, semester]);

    res.json({ success: true, feedback_count: parseInt(rows[0].feedback_count) || 0 });
  } catch (error) {
    console.error("Error fetching feedback count for teacher:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

