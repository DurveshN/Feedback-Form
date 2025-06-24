const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

exports.generateStudentLoginPDF = async (req, res) => {
  try {
    const { department_id } = req.user;
    const { academic_year, semester, year, count } = req.body;

    if (!academic_year || !semester || !year || !count) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }
    const yearNum = parseInt(year);
    const yearPrefix = yearNum === 2 ? "SE" : yearNum === 3 ? "TE" : "BE";

    const existingRes = await pool.query(
      `SELECT username FROM student_login WHERE department_id = $1 AND year = $2`,
      [department_id, semester]
    );
    const existingUsernames = new Set(existingRes.rows.map(row => row.username));

    const credentials = [];
    let index = 1;

    while (credentials.length < count) {
      const padded = String(index).padStart(2, "0");
      const username = `${yearPrefix}${padded}`;

      if (!existingUsernames.has(username)) {
        const password = Math.floor(1000 + Math.random() * 9000).toString();
        credentials.push({ username, password });
        existingUsernames.add(username);
      }
      index++;
    }

    const insertQuery = `
      INSERT INTO student_login (department_id, username, password, year, used, academic_year)
      VALUES ${credentials.map((_, i) => `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4}, $${credentials.length * 3 + 2}, $${credentials.length * 3 + 3})`).join(", ")}
    `;
    const insertValues = [
      department_id,
      ...credentials.flatMap(c => [c.username, c.password, semester]),
      false,
      academic_year
    ];
    await pool.query(insertQuery, insertValues);

    const deptRes = await pool.query(`SELECT name FROM departments WHERE id = $1`, [department_id]);
    const departmentName = deptRes.rows[0]?.name || "Department";

    const templatePath = path.join(__dirname, '../templates/student_login.pdf');
    const templateBytes = await fs.promises.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);

    const [templatePage] = pdfDoc.getPages();
    let currentPage = pdfDoc.addPage([templatePage.getWidth(), templatePage.getHeight()]);
    const { width, height } = currentPage.getSize();

    const embeddedTemplate = await pdfDoc.embedPage(templatePage);
    currentPage.drawPage(embeddedTemplate, { x: 0, y: 0 });

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const applyTemplateFields = (page) => {
      page.drawText(departmentName, { x: 160, y: 665, size: 12, font: helvetica });
      page.drawText(semester.toString(), { x: 120, y: 650, size: 12, font: helvetica });
      page.drawText(academic_year, { x: 360, y: 665, size: 12, font: helvetica });
      page.drawText(academic_year, { x: 310, y: 650, size: 12, font: helvetica });
      page.drawText(semester.toString(), { x: 500, y: 665, size: 12, font: helvetica });
      page.drawText(formattedDate, { x: 500, y: 650, size: 10, font: helvetica });
    };

    applyTemplateFields(currentPage);

    const startY = height - 250;
    let currentY = startY;

    currentPage.drawText("Username", { x: 80, y: currentY, size: 12, font: helveticaBold });
    currentPage.drawText("Password", { x: 300, y: currentY, size: 12, font: helveticaBold });
    currentY -= 25;

    for (const { username, password } of credentials) {
      if (currentY < 100) {
        currentPage = pdfDoc.addPage([width, height]);
        const embeddedPage = await pdfDoc.embedPage(templatePage);
        currentPage.drawPage(embeddedPage, { x: 0, y: 0 });
        applyTemplateFields(currentPage);
        currentY = height - 250;
        currentPage.drawText("Username", { x: 80, y: currentY, size: 12, font: helveticaBold });
        currentPage.drawText("Password", { x: 300, y: currentY, size: 12, font: helveticaBold });
        currentY -= 25;
      }

      currentPage.drawText(username, { x: 80, y: currentY, size: 12, font: helvetica });
      currentPage.drawText(password, { x: 300, y: currentY, size: 12, font: helvetica });
      currentY -= 20;
    }

    if (pdfDoc.getPages().length > 0 && pdfDoc.getPages()[0] === templatePage) {
      pdfDoc.removePage(0);
    }

    const pdfBytes = await pdfDoc.save();

    const fileName = `StudentLogins_${departmentName.replace(/\s+/g, '_')}_${yearPrefix}_${now.getTime()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("Error generating login PDF:", err.stack);
    res.status(500).json({ success: false, message: "Server error generating PDF" });
  }
};

exports.deleteUsedLogins = async (req, res) => {
  try {
    const { department_id } = req.user;
    const query = `DELETE FROM student_login WHERE department_id = $1 AND used = TRUE`;
    await pool.query(query, [department_id]);
    res.json({ success: true, message: "All used logins deleted" });
  } catch (err) {
    console.error("Error deleting used logins:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};