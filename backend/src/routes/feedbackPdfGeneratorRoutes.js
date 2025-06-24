// feedbackPdfGeneratorRoutes.js
const express = require("express");
const {
  getTeacherSubjectsForFeedback,
  generateFeedbackPDF,
  getRawFeedbackData
} = require("../controllers/feedbackPdfGeneratorController");

const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get('/pdf', authenticateUser, generateFeedbackPDF);
router.get('/teacher-subjects', authenticateUser, getTeacherSubjectsForFeedback);
router.get('/excel', authenticateUser, getRawFeedbackData);
module.exports = router;
