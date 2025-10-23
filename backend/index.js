require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./src/config/db");

// Import Routes
const authRoutes = require("./src/routes/authRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const teacherRoutes = require("./src/routes/teacherRoutes");
const departmentRoutes = require("./src/routes/departmentRoutes");
const hodRoutes = require("./src/routes/hodRoutes");
const semesterRoutes = require("./src/routes/semesterRoutes");
const questionRoutes = require("./src/routes/questionRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const teacherSubjectRoutes = require("./src/routes/teacherSubjectRoutes");
// const studentLoginRoutes = require("./src/routes/studentLoginRoutes");
const teacherAnalyticsRoutes = require("./src/routes/teacherAnalyticsRoutes");
const subjectRoutes = require("./src/routes/subjectRoutes");
const studentLoginPdfRoutes = require("./src/routes/studentLoginPdfRoutes");
const feedbackPdfGeneratorRoutes = require("./src/routes/feedbackPdfGeneratorRoutes");
const teacherAnalysisRoutes = require('./src/routes/teacherAnalysisRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes (Ensure all routes have `/api` prefix)
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/hods", hodRoutes);
app.use("/api/semester", semesterRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/teacher-subjects", teacherSubjectRoutes);
// app.use("/api/student-login", studentLoginRoutes);
app.use("/api/teacher-analytics", teacherAnalyticsRoutes);
app.use("/api/hod/subjects", subjectRoutes);
app.use("/api/student-login", studentLoginPdfRoutes);
app.use("/api/feedback-generator", feedbackPdfGeneratorRoutes);
app.use('/api/teacher-analysis', teacherAnalysisRoutes);

// Root Route (To check if the server is running)
app.get("/", (req, res) => {
  res.send("Feedback System Backend is Running!");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start Server
app.listen(PORT, async () => {
  try {
    await db.connect(); // Ensure DB connection is established before starting
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("❌ Failed to connect to database", error);
    process.exit(1);
  }
});
