const express = require('express');
const { authenticateUser } = require("../middleware/authMiddleware");
const router = express.Router();
const { 
    getAcademicYears,
    getTeachersByYear,
    getSubjectsByTeacher,
    getTeacherAnalysisData
 } = require('../controllers/feedbackAnalysisController');

// Routes for teacher analysis
router.get('/academic-years', authenticateUser, getAcademicYears);
router.get('/teachers', authenticateUser, getTeachersByYear);
router.get('/subjects', authenticateUser, getSubjectsByTeacher);
router.get('/data', authenticateUser, getTeacherAnalysisData);

module.exports = router;