const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  getPieYearData,
  getBarYearComparisonData,
  getAcademicYears,
  getDepartmentFeedbackCount
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/pie", authenticateUser, getPieYearData);
router.get("/bar", authenticateUser, getBarYearComparisonData);
router.get("/years", authenticateUser, getAcademicYears);
router.get("/department-feedback-count", authenticateUser, getDepartmentFeedbackCount); 

module.exports = router;
