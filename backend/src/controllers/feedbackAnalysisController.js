const pool = require("../config/db");

// Helper function to generate performance review for a question
const generateQuestionReview = (questionText, avgRating) => {
  const threshold = 3.5; // Threshold for identifying low performance
  const improvements = {
    "Quality of notes/materials provided": "Consider enhancing the quality of notes by incorporating more visual aids, updated references, and concise summaries to improve student understanding.",
    "Clarity in teaching and explanation": "Focus on simplifying complex concepts, using clear examples, and maintaining a steady pace to enhance clarity during lectures.",
    "Use of real-world examples": "Incorporate more industry-relevant examples and case studies to make the subject matter more relatable and engaging for students.",
    "Regularity of classes": "Ensure consistent scheduling and timely completion of the syllabus to avoid rushed sessions towards the end of the semester.",
    "Encouragement of student participation": "Encourage active participation by incorporating interactive activities, group discussions, or Q&A sessions to boost engagement.",
    "Clarity in doubt resolution": "Dedicate specific time for doubt resolution and provide detailed, patient explanations to address student queries effectively.",
    "Depth of subject knowledge": "Deepen subject expertise by staying updated with recent advancements and sharing advanced insights with students.",
    "Punctuality and class duration": "Maintain strict adherence to class schedules and utilize the full duration effectively to cover all topics thoroughly.",
    "Availability for guidance": "Increase availability for one-on-one guidance or office hours to provide personalized support to students.",
    "Structure of practical sessions": "Design practical sessions with clear objectives, step-by-step guidance, and adequate time for hands-on practice.",
    "Demonstration in practicals": "Provide detailed demonstrations and ensure students understand the procedures before conducting practicals.",
    "Discussion of practical results": "Facilitate thorough discussions of practical outcomes, linking them to theoretical concepts for better understanding.",
    "Relevance of practicals to industry": "Highlight the industry applications of practicals to make them more relevant and motivating for students.",
    "Presence during practicals": "Ensure consistent presence and active supervision during practical sessions to assist students effectively.",
    "Safety instructions in practicals": "Emphasize safety protocols and provide clear instructions on equipment handling to ensure a safe learning environment.",
    "Fairness in assessment": "Adopt a transparent and consistent marking system, providing constructive feedback to help students improve.",
    "Journal checking and feedback": "Regularly check journals and provide detailed, timely feedback to guide students in improving their work.",
    "Use of modern teaching aids": "Incorporate digital tools, projectors, or online resources to make lectures more interactive and engaging.",
    "Overall teaching effectiveness": "Focus on holistic improvement in teaching methods, student engagement, and knowledge delivery to enhance the overall learning experience.",
  };

  if (avgRating < threshold) {
    const questionKey = questionText.split('.')[1]?.trim().split('?')[0]?.trim() || questionText;
    return {
      review: `The average rating of ${avgRating.toFixed(2)} for "${questionText}" indicates room for improvement.`,
      improvement: improvements[questionKey] || "Consider reviewing teaching methods and seeking student feedback to identify specific areas for enhancement."
    };
  }
  return null;
};

// Helper function to generate overall performance review
const generateOverallReview = (ratings) => {
  const avgOverallRating = ratings.length
    ? ratings.reduce((sum, row) => sum + parseFloat(row.avg_rating), 0) / ratings.length
    : 0;

  let overallReview = "";
  let overallImprovement = "";
  if (avgOverallRating >= 4.5) {
    overallReview = "Outstanding performance! The teacher consistently delivers high-quality instruction across all evaluated aspects.";
    overallImprovement = "Continue maintaining this excellent standard, perhaps by exploring innovative teaching methods to further enhance student engagement.";
  } else if (avgOverallRating >= 3.5) {
    overallReview = "Good performance overall, with strong delivery in most areas of teaching.";
    overallImprovement = "Focus on refining areas with lower ratings, such as incorporating more interactive elements or addressing specific student feedback.";
  } else if (avgOverallRating >= 2.5) {
    overallReview = "Moderate performance with noticeable strengths but some areas needing improvement.";
    overallImprovement = "Identify specific weaknesses through student feedback and consider professional development or peer mentoring to improve teaching effectiveness.";
  } else {
    overallReview = "Performance requires significant improvement to meet expectations.";
    overallImprovement = "Seek targeted training, adopt modern teaching aids, and engage with students to understand and address their learning needs.";
  }

  return {
    review: `Overall Performance: ${overallReview} (Average Rating: ${avgOverallRating.toFixed(2)})`,
    improvement: overallImprovement
  };
};

// Fetch distinct academic years for the department
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
    res.json({ success: true, years: ['All', ...rows.map((r) => r.academic_year)] });
  } catch (err) {
    console.error("Error fetching academic years:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch teachers who taught in a specific academic year (or all years)
exports.getTeachersByYear = async (req, res) => {
  try {
    const { department_id } = req.user;
    const { academic_year } = req.query;

    if (!academic_year) {
      return res.status(400).json({ success: false, message: "Academic year is required" });
    }

    let query = `
      SELECT DISTINCT t.id, t.name AS teacher_name
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      WHERE s.department_id = $1
    `;
    const params = [department_id];

    if (academic_year !== 'All') {
      query += ` AND ts.academic_year = $2`;
      params.push(academic_year);
    }

    query += ` ORDER BY t.name ASC;`;

    const { rows } = await pool.query(query, params);
    res.json({ success: true, teachers: rows });
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch subjects taught by a specific teacher in a given academic year (or all years)
exports.getSubjectsByTeacher = async (req, res) => {
  try {
    const { department_id } = req.user;
    const { teacher_id, academic_year } = req.query;

    if (!teacher_id || !academic_year) {
      return res.status(400).json({ success: false, message: "Teacher ID and academic year are required" });
    }

    let query = `
      SELECT DISTINCT ts.id AS teacher_subject_id, s.name AS subject_name, ts.semester, COALESCE(s.type, 'theory') AS subject_type
      FROM teacher_subjects ts
      JOIN subjects s ON ts.subject_id = s.id
      WHERE ts.teacher_id = $1
        AND s.department_id = $2
    `;
    const params = [teacher_id, department_id];

    if (academic_year !== 'All') {
      query += ` AND ts.academic_year = $3`;
      params.push(academic_year);
    }

    query += ` ORDER BY s.name, ts.semester;`;

    const { rows } = await pool.query(query, params);
    res.json({ success: true, subjects: [{ teacher_subject_id: 'All', subject_name: 'All Subjects', subject_type: 'all' }, ...rows] });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch analysis data for a specific teacher and subject(s)
exports.getTeacherAnalysisData = async (req, res) => {
  try {
    const { department_id } = req.user;
    const { teacher_id, academic_year, teacher_subject_id } = req.query;

    if (!teacher_id || !academic_year || !teacher_subject_id) {
      return res.status(400).json({ success: false, message: "Teacher ID, academic year, and teacher-subject ID are required" });
    }

    // Determine subject type for question filtering
    let subject_type = 'all';
    if (teacher_subject_id !== 'All') {
      const subjectQuery = `
        SELECT COALESCE(s.type, 'theory') AS subject_type
        FROM teacher_subjects ts
        JOIN subjects s ON ts.subject_id = s.id
        WHERE ts.id = $1 AND s.department_id = $2;
      `;
      const subjectResult = await pool.query(subjectQuery, [teacher_subject_id, department_id]);
      if (subjectResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Subject not found" });
      }
      subject_type = subjectResult.rows[0].subject_type;
    }

    // Fetch rating data for bar charts
    let query = `
      SELECT 
        q.id,
        q.text AS question_text,
        q.type AS question_type,
        COUNT(CASE WHEN f.rating = 5 THEN 1 END) AS excellent,
        COUNT(CASE WHEN f.rating = 4 THEN 1 END) AS very_good,
        COUNT(CASE WHEN f.rating = 3 THEN 1 END) AS good,
        COUNT(CASE WHEN f.rating = 2 THEN 1 END) AS satisfactory,
        COUNT(CASE WHEN f.rating = 1 THEN 1 END) AS not_satisfactory,
        COUNT(f.rating) AS total_responses,
        ROUND(AVG(f.rating)::numeric, 2) AS avg_rating
      FROM feedback f
      JOIN questions q ON f.question_id = q.id
      JOIN teacher_subjects ts ON f.teacher_subject_id = ts.id
      JOIN subjects s ON ts.subject_id = s.id
      WHERE ts.teacher_id = $1
        AND s.department_id = $2
    `;
    const params = [teacher_id, department_id];

    if (academic_year !== 'All') {
      query += ` AND f.academic_year = $${params.length + 1}`;
      params.push(academic_year);
    }

    if (teacher_subject_id !== 'All') {
      query += ` AND f.teacher_subject_id = $${params.length + 1}`;
      params.push(teacher_subject_id);
    }

    if (subject_type !== 'all') {
      query += ` AND q.type = $${params.length + 1}`;
      params.push(subject_type);
    } else {
      query += ` AND q.type IN ('theory', 'practical')`;
    }

    query += ` GROUP BY q.id, q.text, q.type ORDER BY q.type, q.id;`;

    const { rows } = await pool.query(query, params);

    // Split data into theory and practical
    const theoryData = rows
      .filter(row => row.question_type === 'theory')
      .map(row => ({
        question_id: row.id,
        question_text: row.question_text,
        avg_rating: parseFloat(row.avg_rating),
        distribution: {
          Excellent: row.total_responses ? ((row.excellent / row.total_responses) * 100).toFixed(2) : 0,
          VeryGood: row.total_responses ? ((row.very_good / row.total_responses) * 100).toFixed(2) : 0,
          Good: row.total_responses ? ((row.good / row.total_responses) * 100).toFixed(2) : 0,
          Satisfactory: row.total_responses ? ((row.satisfactory / row.total_responses) * 100).toFixed(2) : 0,
          NotSatisfactory: row.total_responses ? ((row.not_satisfactory / row.total_responses) * 100).toFixed(2) : 0
        }
      }));

    const practicalData = rows
      .filter(row => row.question_type === 'practical')
      .map(row => ({
        question_id: row.id,
        question_text: row.question_text,
        avg_rating: parseFloat(row.avg_rating),
        distribution: {
          Excellent: row.total_responses ? ((row.excellent / row.total_responses) * 100).toFixed(2) : 0,
          VeryGood: row.total_responses ? ((row.very_good / row.total_responses) * 100).toFixed(2) : 0,
          Good: row.total_responses ? ((row.good / row.total_responses) * 100).toFixed(2) : 0,
          Satisfactory: row.total_responses ? ((row.satisfactory / row.total_responses) * 100).toFixed(2) : 0,
          NotSatisfactory: row.total_responses ? ((row.not_satisfactory / row.total_responses) * 100).toFixed(2) : 0
        }
      }));

    // Generate performance reviews for each question
    const questionReviews = rows
      .filter(row => row.question_type !== 'text-answer')
      .map(row => generateQuestionReview(row.question_text, parseFloat(row.avg_rating)))
      .filter(review => review !== null);

    // Generate overall performance review
    const overallReview = generateOverallReview(rows.filter(row => row.question_type !== 'text-answer'));

    res.json({
      success: true,
      data: {
        barCharts: {
          theory: theoryData,
          practical: practicalData
        },
        questionReviews,
        overallReview
      }
    });
  } catch (err) {
    console.error("Error fetching teacher analysis data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};