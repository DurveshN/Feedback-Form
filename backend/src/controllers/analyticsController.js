const pool = require("../config/db");

// PIE Chart - Theory and Practical
exports.getPieYearData = async (req, res) => {
  try {
    const { department_id } = req.user;
    const { academic_year, student_year, semester } = req.query;

    const query = `
      SELECT 
        t.name AS teacher_name,
        COALESCE(s.type, 'theory') AS subject_type,
        ROUND(AVG(f.rating)::numeric, 2) AS avg_rating
      FROM feedback f
      JOIN teacher_subjects ts ON f.teacher_subject_id = ts.id
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      WHERE s.department_id = $1
        AND f.academic_year = $2
        AND ts.year = $3
        AND f.semester = $4
      GROUP BY t.name, COALESCE(s.type, 'theory')
      ORDER BY COALESCE(s.type, 'theory'), avg_rating DESC;
    `;

    const { rows } = await pool.query(query, [department_id, academic_year, student_year, semester]);
    
    // Separate data by type
    const theoryData = rows.filter(row => row.subject_type === 'theory');
    const practicalData = rows.filter(row => row.subject_type === 'practical');
    
    res.json({ 
      success: true, 
      data: { 
        theory: theoryData, 
        practical: practicalData 
      } 
    });
  } catch (err) {
    console.error("Error fetching pie chart data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Bar Chart - Theory and Practical Comparison
exports.getBarYearComparisonData = async (req, res) => {
  try {
    const { department_id } = req.user;
    const { academic_year, student_year } = req.query;

    const query = `
      SELECT 
        t.name AS teacher_name,
        f.semester,
        COALESCE(s.type, 'theory') AS subject_type,
        ROUND(AVG(f.rating)::numeric, 2) AS avg_rating
      FROM feedback f
      JOIN teacher_subjects ts ON f.teacher_subject_id = ts.id
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      WHERE s.department_id = $1
        AND f.academic_year = $2
        AND ts.year = $3
      GROUP BY t.name, f.semester, COALESCE(s.type, 'theory')
      ORDER BY COALESCE(s.type, 'theory'), t.name ASC, f.semester ASC;
    `;

    const { rows } = await pool.query(query, [department_id, academic_year, student_year]);
    
    // Separate data by type
    const theoryData = rows.filter(row => row.subject_type === 'theory');
    const practicalData = rows.filter(row => row.subject_type === 'practical');
    
    res.json({ 
      success: true, 
      data: { 
        theory: theoryData, 
        practical: practicalData 
      } 
    });
  } catch (err) {
    console.error("Error fetching bar chart data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Dropdown years
exports.getAcademicYears = async (req, res) => {
  try {
    const { department_id } = req.user;

    const query = `
      SELECT DISTINCT f.academic_year
      FROM feedback f
      JOIN teacher_subjects ts ON f.teacher_subject_id = ts.id
      JOIN subjects s ON ts.subject_id = s.id
      WHERE s.department_id = $1
      ORDER BY f.academic_year ASC;
    `;

    const { rows } = await pool.query(query, [department_id]);
    res.json({ success: true, years: rows.map((r) => r.academic_year) });
  } catch (err) {
    console.error("Error fetching academic years:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Feedback count (HOD)
exports.getDepartmentFeedbackCount = async (req, res) => {
  try {
    const { department_id } = req.user;
    const { academic_year, student_year, semester } = req.query;

    const query = `
      SELECT COUNT(DISTINCT f.submission_id) AS total_feedback
      FROM feedback f
      JOIN teacher_subjects ts ON f.teacher_subject_id = ts.id
      JOIN subjects s ON ts.subject_id = s.id
      WHERE s.department_id = $1
        AND f.academic_year = $2
        AND ts.year = $3
        AND f.semester = $4;
    `;

    const { rows } = await pool.query(query, [
      department_id,
      academic_year,
      student_year,
      semester
    ]);

    res.json({ success: true, total_feedback: parseInt(rows[0].total_feedback) || 0 });
  } catch (error) {
    console.error("Error fetching total feedback for HOD:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};