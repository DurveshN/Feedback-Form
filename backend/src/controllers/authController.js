const pool = require("../config/db");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const hodQuery = `SELECT id, username, password, department_id, 'hod' AS role FROM hods WHERE username = $1`;
    const teacherQuery = `SELECT id, username, password, 'teacher' AS role FROM teachers WHERE username = $1`;
    const studentQuery = `SELECT id, username, password, department_id, year, used, academic_year, semester, 'student' AS role FROM student_login WHERE username = $1`;

    let user = null;

    // 1️⃣ HOD login
    const hodResult = await pool.query(hodQuery, [username]);
    if (hodResult.rows.length > 0) {
      user = hodResult.rows[0];
    } else {
      // 2️⃣ Teacher login
      const teacherResult = await pool.query(teacherQuery, [username]);
      if (teacherResult.rows.length > 0) {
        user = teacherResult.rows[0];
      } else {
        // 3️⃣ Student login
        const studentResult = await pool.query(studentQuery, [username]);
        if (studentResult.rows.length > 0) {
          user = studentResult.rows[0];

          // ❌ If already used, deny login
          if (user.used) {
            return res.status(401).json({ error: "Feedback already submitted. Login disabled." });
          }
        }
      }
    }

    // ❌ Invalid credentials
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Build token
    const tokenPayload = {
      id: user.id,
      role: user.role,
    };

    if (user.role === "hod") {
      tokenPayload.department_id = user.department_id;
    }

    if (user.role === "student") {
      tokenPayload.department_id = user.department_id;
      tokenPayload.year = user.year;
      tokenPayload.username = user.username;
      tokenPayload.academic_year = user.academic_year;
      tokenPayload.semester = user.semester;
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      role: user.role,
      department_id: user.department_id,
      year: user.year,
      academic_year: user.academic_year,
      semester: user.semester
    });

  } catch (error) {
    console.error("🔥 Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};