// backend/controllers/feedbackController.js
const { PDFDocument, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const pool = require('../config/db');

function estimateTextHeight(text, font, fontSize, maxWidth) {
  if (!text) return fontSize * 1.2;

  const words = text.split(' ');
  let lines = 1;
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth && currentLine) {
      lines++;
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  return lines * fontSize * 1.2;
}

exports.generateFeedbackPDF = async (req, res) => {
  try {
    const { teacher_subject_id, academic_year, student_year, semester } = req.query;

    if (!teacher_subject_id || !academic_year || !student_year || !semester) {
      return res.status(400).json({ success: false, message: "All query parameters required" });
    }

    // Fetch teacher, subject, department, and subject type
    const teacherSubjectQuery = `
      SELECT 
        t.name AS teacher_name,
        s.name AS subject_name,
        s.type AS subject_type,
        d.name AS department_name
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      JOIN departments d ON s.department_id = d.id
      WHERE ts.id = $1
        AND ts.academic_year = $2
        AND ts.year = $3
        AND ts.semester = $4;
    `;
    const teacherSubjectResult = await pool.query(teacherSubjectQuery, [
      teacher_subject_id,
      academic_year,
      student_year,
      semester,
    ]);

    if (!teacherSubjectResult.rows.length) {
      return res.status(404).json({ success: false, message: "Teacher-subject assignment not found" });
    }
    const { teacher_name, subject_name, subject_type, department_name } = teacherSubjectResult.rows[0];

    // Fetch feedback count
    const feedbackCountQuery = `
      SELECT COUNT(DISTINCT submission_id) AS feedback_count
      FROM feedback f
      JOIN teacher_subjects ts ON f.teacher_subject_id = ts.id
      WHERE f.teacher_subject_id = $1
        AND f.academic_year = $2
        AND ts.year = $3
        AND ts.semester = $4;
    `;
    const feedbackCountResult = await pool.query(feedbackCountQuery, [
      teacher_subject_id,
      academic_year,
      student_year,
      semester,
    ]);
    const feedback_count = parseInt(feedbackCountResult.rows[0]?.feedback_count) || 0;

    // Fetch rating data for type-specific questions
    const ratingQuery = `
      SELECT 
        q.id,
        q.text,
        q.type,
        COUNT(CASE WHEN f.rating = 5 THEN 1 END) AS excellent,
        COUNT(CASE WHEN f.rating = 4 THEN 1 END) AS very_good,
        COUNT(CASE WHEN f.rating = 3 THEN 1 END) AS good,
        COUNT(CASE WHEN f.rating = 2 THEN 1 END) AS satisfactory,
        COUNT(CASE WHEN f.rating = 1 THEN 1 END) AS not_satisfactory,
        COUNT(f.rating) AS total_responses,
        AVG(f.rating) AS avg_rating
      FROM feedback f
      JOIN questions q ON f.question_id = q.id
      JOIN teacher_subjects ts ON f.teacher_subject_id = ts.id
      WHERE f.teacher_subject_id = $1
        AND f.academic_year = $2
        AND ts.year = $3
        AND f.semester = $4
        AND q.type = $5
      GROUP BY q.id, q.text, q.type
      ORDER BY q.id;
    `;
    const ratingResult = await pool.query(ratingQuery, [
      teacher_subject_id,
      academic_year,
      student_year,
      semester,
      subject_type,
    ]);

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Load type-specific template
    const templateName = subject_type === 'theory' ? 'theory.pdf' : 'practical.pdf';
    const templatePath = path.join(__dirname, `../templates/${templateName}`);
    let templateDoc, templatePage;
    try {
      const templateBytes = await fs.readFile(templatePath);
      templateDoc = await PDFDocument.load(templateBytes);
      templatePage = templateDoc.getPage(0);
    } catch (err) {
      return res.status(500).json({ success: false, message: `Template ${templateName} not found` });
    }

    // Load header template for suggestions pages
    const headerTemplatePath = path.join(__dirname, '../templates/header.pdf');
    let headerTemplateDoc, headerPage;
    try {
      const headerBytes = await fs.readFile(headerTemplatePath);
      headerTemplateDoc = await PDFDocument.load(headerBytes);
      headerPage = headerTemplateDoc.getPage(0);
    } catch (err) {
      return res.status(500).json({ success: false, message: "Header template not found" });
    }

    // Add first page with type-specific template
    const currentPage = pdfDoc.addPage([templatePage.getWidth(), templatePage.getHeight()]);
    const { width } = currentPage.getSize();
    const embeddedTemplate = await pdfDoc.embedPage(templatePage);
    currentPage.drawPage(embeddedTemplate, { x: 0, y: 0 });

    // Current date/time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Draw dynamic fields on first page
    currentPage.drawText(teacher_name, {
      x: 100,
      y: 662,
      size: 14,
      font: helveticaBold,
    });
    currentPage.drawText(department_name, {
      x: 430,
      y: 662,
      size: 14,
      font: helveticaBold,
    });
    currentPage.drawText(`${feedback_count}`, {
      x: 155,
      y: 633,
      size: 14,
      font: helveticaBold,
    });
    currentPage.drawText(subject_name, {
      x: 400,
      y: 633,
      size: 14,
      font: helveticaBold,
    });
    currentPage.drawText(`${formattedDate}`, {
      x: 315,
      y: 604,
      size: 14,
      font: helvetica,
    });

    // Fill ratings table
    if (ratingResult.rows.length) {
      const xCoords = [290, 346, 394, 443, 493, 547];
      const yCoordsTheory = [409, 370, 330, 300, 260, 220, 184, 149, 110];
      const yCoordsPractical = [413, 380, 350, 311, 278, 239, 200, 171, 141, 112];
      const yCoords = subject_type === 'theory' ? yCoordsTheory : yCoordsPractical;

      const maxRows = Math.min(ratingResult.rows.length, yCoords.length);
      for (let i = 0; i < maxRows; i++) {
        const row = ratingResult.rows[i];
        const total = row.total_responses || 1;
        const values = [
          ((row.excellent / total) * 100).toFixed(2),
          ((row.very_good / total) * 100).toFixed(2),
          ((row.good / total) * 100).toFixed(2),
          ((row.satisfactory / total) * 100).toFixed(2),
          ((row.not_satisfactory / total) * 100).toFixed(2),
          Number(row.avg_rating).toFixed(2),
        ];

        for (let j = 0; j < xCoords.length; j++) {
          currentPage.drawText(values[j], {
            x: xCoords[j],
            y: yCoords[i],
            size: 14,
            font: helvetica,
          });
        }
      }
    } else {
      currentPage.drawText("No Feedback Available", {
        x: 50,
        y: 500,
        size: 12,
        font: helvetica,
      });
    }

    // Suggestions section
    let newPage = pdfDoc.addPage([headerPage.getWidth(), headerPage.getHeight()]);
    const embeddedHeader = await pdfDoc.embedPage(headerPage);
    newPage.drawPage(embeddedHeader, { x: 0, y: 0 });

    let currentY = 680;
    const leftMargin = 50;
    const rightMargin = 50;
    const maxWidth = width - leftMargin - rightMargin;

    newPage.drawText("Suggestions", {
      x: leftMargin,
      y: currentY,
      size: 16,
      font: helveticaBold,
    });
    currentY -= 30;

    // Fetch text-answer feedback
    const textQuery = `
      SELECT q.id, q.text, f.text_answer
      FROM feedback f
      JOIN questions q ON f.question_id = q.id
      JOIN teacher_subjects ts ON f.teacher_subject_id = ts.id
      WHERE f.teacher_subject_id = $1
        AND f.academic_year = $2
        AND ts.year = $3
        AND f.semester = $4
        AND q.type = 'text-answer'
      ORDER BY q.id, f.id;
    `;
    const textResult = await pool.query(textQuery, [
      teacher_subject_id,
      academic_year,
      student_year,
      semester,
    ]);

    // Fetch all text-answer questions
    const textQuestionsQuery = `
      SELECT DISTINCT q.text, q.id
      FROM questions q
      WHERE q.type = 'text-answer'
      ORDER BY q.id ASC;
    `;
    const textQuestionsResult = await pool.query(textQuestionsQuery);
    const textQuestions = textQuestionsResult.rows.map(row => row.text.replace(/[\n\r]/g, ' ').trim());

    if (textQuestions.length) {
      // Group answers from textResult by question
      const answersByQuestion = {};
      textResult.rows.forEach((row) => {
        const sanitizedQuestion = row.text.replace(/[\n\r]/g, ' ').trim();
        const sanitizedAnswer = row.text_answer ? row.text_answer.replace(/[\n\r]/g, ' ').trim() : '';
        if (!answersByQuestion[sanitizedQuestion]) {
          answersByQuestion[sanitizedQuestion] = [];
        }
        if (sanitizedAnswer) {
          answersByQuestion[sanitizedQuestion].push(sanitizedAnswer);
        }
      });

      let qIndex = 0;
      for (const questionText of textQuestions) {
        qIndex++;

        const questionHeight = estimateTextHeight(questionText, helveticaBold, 12, maxWidth) + 25;
        if (currentY - questionHeight < 50) {
          newPage = pdfDoc.addPage([headerPage.getWidth(), headerPage.getHeight()]);
          newPage.drawPage(embeddedHeader, { x: 0, y: 0 });
          currentY = 680;
        }

        newPage.drawText(`${qIndex}. ${questionText}`, {
          x: leftMargin,
          y: currentY,
          size: 14,
          font: helveticaBold,
          maxWidth: maxWidth,
        });
        currentY -= questionHeight;

        const answers = answersByQuestion[questionText] || [];
        for (const answer of answers) {
          const answerText = `- ${answer}`;
          const answerHeight = estimateTextHeight(answerText, helvetica, 11, maxWidth - 10) + 5;

          if (currentY - answerHeight < 50) {
            newPage = pdfDoc.addPage([headerPage.getWidth(), headerPage.getHeight()]);
            newPage.drawPage(embeddedHeader, { x: 0, y: 0 });
            currentY = 680;
          }

          newPage.drawText(answerText, {
            x: leftMargin + 10,
            y: currentY,
            size: 14,
            font: helvetica,
            maxWidth: maxWidth - 10,
          });
          currentY -= answerHeight;
        }

        currentY -= 15;
      }
    } else {
      newPage.drawText("No Suggestions Questions Available", {
        x: leftMargin,
        y: currentY,
        size: 16,
        font: helvetica,
      });
    }

    // Save and send PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `Feedback_${teacher_name.replace(/\s/g, '_')}_${subject_name.replace(/\s/g, '_')}_${academic_year}_${semester}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error('PDF Generation Error:', err.message);
    res.status(500).json({ success: false, message: `Server error generating PDF: ${err.message}` });
  }
};

exports.getTeacherSubjectsForFeedback = async (req, res) => {
  try {
    const { department_id } = req.user;
    const { academic_year, year } = req.query;

    if (!academic_year || !year) {
      return res.status(400).json({ success: false, message: "Academic year and year are required" });
    }

    const query = `
      SELECT 
        ts.id AS teacher_subject_id,
        s.name AS subject_name,
        t.name AS teacher_name,
        ts.semester
      FROM teacher_subjects ts
      JOIN teachers t ON ts.teacher_id = t.id
      JOIN subjects s ON ts.subject_id = s.id
      WHERE s.department_id = $1
        AND ts.academic_year = $2
        AND ts.year = $3
      ORDER BY s.name, t.name, ts.semester;
    `;
    const params = [department_id, academic_year, year];

    const { rows } = await pool.query(query, params);
    res.json({ success: true, teacher_subjects: rows });
  } catch (error) {
    console.error("Error fetching teacher-subject pairs for feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Raw Feedback Data for Excel
exports.getRawFeedbackData = async (req, res) => {
  try {
    const { department_id } = req.user;
    const { teacher_subject_id, academic_year, student_year, semester } = req.query;

    // Get subject type
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
    const subjectType = subjectResult.rows[0].subject_type;

    // Get students who submitted feedback
    const studentsQuery = `
      SELECT DISTINCT f.username
      FROM feedback f
      JOIN teacher_subjects ts ON f.teacher_subject_id = ts.id
      JOIN subjects s ON ts.subject_id = s.id
      WHERE f.teacher_subject_id = $1
        AND f.academic_year = $2
        AND ts.year = $3
        AND f.semester = $4
        AND s.department_id = $5
      ORDER BY f.username ASC;
    `;
    const studentsResult = await pool.query(studentsQuery, [
      teacher_subject_id,
      academic_year,
      student_year,
      semester,
      department_id
    ]);
    const students = studentsResult.rows;

    if (!students.length) {
      console.log(`No students found for teacher_subject_id: ${teacher_subject_id}, academic_year: ${academic_year}, student_year: ${student_year}, semester: ${semester}, department_id: ${department_id}`);
      return res.json({ success: true, data: { questions: [], feedback: [] } });
    }

    // Get questions (theory/practical and text-answer)
    const questionsQuery = `
      SELECT q.id, q.text, q.type
      FROM questions q
      WHERE q.type = $1 OR q.type = 'text-answer'
      ORDER BY q.type, q.id ASC;
    `;
    const questionsResult = await pool.query(questionsQuery, [subjectType]);
    const ratingQuestions = questionsResult.rows.filter(q => q.type === subjectType);
    const textQuestions = questionsResult.rows.filter(q => q.type === 'text-answer');

    // Get feedback data
    const feedbackQuery = `
      SELECT f.username, q.text AS question_text, q.type AS question_type, f.rating, f.text_answer
      FROM feedback f
      JOIN questions q ON f.question_id = q.id
      JOIN teacher_subjects ts ON f.teacher_subject_id = ts.id
      JOIN subjects s ON ts.subject_id = s.id
      WHERE f.teacher_subject_id = $1
        AND f.academic_year = $2
        AND ts.year = $3
        AND f.semester = $4
        AND s.department_id = $5
        AND q.type IN ($6, 'text-answer')
      ORDER BY f.username, q.type, q.id;
    `;
    const feedbackResult = await pool.query(feedbackQuery, [
      teacher_subject_id,
      academic_year,
      student_year,
      semester,
      department_id,
      subjectType
    ]);

    // console.log(`Feedback query results: ${JSON.stringify(feedbackResult.rows)}`);

    // Build data matrix
    const data = students.map(student => {
      const row = { username: student.username };
      ratingQuestions.forEach(q => {
        row[q.text] = '';
      });
      textQuestions.forEach(q => {
        row[q.text] = '';
      });
      return row;
    });

    // Populate ratings and text answers
    feedbackResult.rows.forEach(fb => {
      const studentIndex = data.findIndex(d => d.username === fb.username);
      if (studentIndex !== -1) {
        if (fb.question_type === subjectType) {
          data[studentIndex][fb.question_text] = fb.rating !== null ? fb.rating.toString() : '';
        } else if (fb.question_type === 'text-answer') {
          data[studentIndex][fb.question_text] = fb.text_answer || '';
        }
      }
    });

    res.json({
      success: true,
      data: {
        questions: [
          ...ratingQuestions.map(q => ({ text: q.text, type: subjectType })),
          ...textQuestions.map(q => ({ text: q.text, type: 'text-answer' }))
        ],
        feedback: data
      }
    });
  } catch (err) {
    console.error("Error fetching raw feedback data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};