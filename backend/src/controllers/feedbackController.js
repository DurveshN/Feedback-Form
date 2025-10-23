const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.getAssignedSubjects = async (req, res) => {
  try {
    const { role, department_id, year, id, academic_year, username } = req.user;

    let query, params;

    if (role === "student") {
      if (!academic_year || !year || !username) {
        return res.status(400).json({
          success: false,
          message: "Academic year, semester, or username not configured for this login.",
        });
      }

      // Derive student year from username prefix (SE -> 2nd year, TE -> 3rd year, BE -> 4th year)
      let studentYear;
      if (username.startsWith("FE")) {
        studentYear = 1;
      } else if (username.startsWith("SE")) {
        studentYear = 2;
      } else if (username.startsWith("TE")) {
        studentYear = 3;
      } else if (username.startsWith("BE")) {
        studentYear = 4;
      }  else {
        return res.status(400).json({
          success: false,
          message: "Invalid username format for student year.",
        });
      }

      query = `
        SELECT 
          ts.id AS teacher_subject_id,
          t.name AS teacher_name,
          s.name AS subject_name,
          s.type AS subject_type
        FROM teacher_subjects ts
        JOIN teachers t ON ts.teacher_id = t.id
        JOIN subjects s ON ts.subject_id = s.id
        WHERE s.department_id = $1
          AND ts.semester = $2
          AND ts.academic_year = $3
          AND ts.year = $4
      `;
      params = [department_id, year, academic_year, studentYear];

      const { rows } = await pool.query(query, params);
      
      if (!rows.length) {
        console.log(`No subjects found for department_id: ${department_id}, semester: ${year}, academic_year: ${academic_year}, year: ${studentYear}`);
      }

      res.json({ success: true, assignments: rows });
    } else if (role === "teacher") {
      query = `
        SELECT 
          ts.id AS teacher_subject_id,
          s.name AS subject_name,
          s.type AS subject_type,
          ts.year,
          ts.semester,
          ts.academic_year,
          t.name AS teacher_name
        FROM teacher_subjects ts
        JOIN subjects s ON ts.subject_id = s.id
        JOIN teachers t ON ts.teacher_id = t.id
        WHERE ts.teacher_id = $1
      `;
      params = [id];

      const { rows } = await pool.query(query, params);
      res.json({ success: true, assignments: rows });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized role" });
    }
  } catch (error) {
    console.error("Error fetching teacher-subject assignments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { subject_type } = req.query;

    if (!subject_type || !['theory', 'practical'].includes(subject_type)) {
      return res.status(400).json({ success: false, message: "Valid subject type (theory/practical) required" });
    }

    const query = `
      SELECT 
        id, text, type
      FROM questions
      WHERE type = $1 OR type = 'text-answer'
      ORDER BY id
    `;
    const { rows } = await pool.query(query, [subject_type]);

    res.json({ success: true, questions: rows });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { teacher_subject_id, rating, text_answer, question_id, submission_id, academic_year } = req.body;
    const { username, year } = req.user;

    if (!academic_year || !year) {
      return res.status(400).json({ success: false, message: "Academic year and semester are required" });
    }

    const subjectQuery = `
      SELECT s.type
      FROM teacher_subjects ts
      JOIN subjects s ON ts.subject_id = s.id
      WHERE ts.id = $1
    `;
    const subjectRes = await pool.query(subjectQuery, [teacher_subject_id]);

    if (!subjectRes.rows.length) {
      return res.status(404).json({ success: false, message: "Teacher-subject link not found" });
    }

    const subjectType = subjectRes.rows[0].type;

    const questionQuery = `
      SELECT type
      FROM questions
      WHERE id = $1
    `;
    const questionRes = await pool.query(questionQuery, [question_id]);

    if (!questionRes.rows.length) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    const questionType = questionRes.rows[0].type;

    if (
      questionType !== 'text-answer' &&
      ((subjectType === 'theory' && questionType !== 'theory') ||
       (subjectType === 'practical' && questionType !== 'practical'))
    ) {
      return res.status(400).json({ success: false, message: "Question type does not match subject type" });
    }

    const query = `
      INSERT INTO feedback (teacher_subject_id, academic_year, semester, rating, text_answer, question_id, submission_id, username)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      teacher_subject_id,
      academic_year,
      year,
      rating !== null ? Number(rating) : null,
      text_answer,
      question_id,
      submission_id,
      username,
    ];

    const { rows } = await pool.query(query, values);
    // ✅ Mark student login as used
    if (req.user?.role === "student") {
      await pool.query(
        `UPDATE student_login SET used = TRUE WHERE username = $1`,
        [req.user.username]
      );
    }
    res.status(201).json({ success: true, feedback: rows[0] });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};