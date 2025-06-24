const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const { 
    getTeacherSubjectGraph,
    getTeacherSubjectFeedbackCount
 } = require("../controllers/teacherAnalyticsController");

const router = express.Router();

// Protected Route (Teacher must be authenticated)
router.get("/teacher-subject-graph", authenticateUser, getTeacherSubjectGraph);
router.get("/subject-feedback-count", authenticateUser, getTeacherSubjectFeedbackCount);

module.exports = router;
