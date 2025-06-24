const express = require("express");
const {
  submitFeedback,
  getQuestions,
  getAssignedSubjects
} = require("../controllers/feedbackController");

const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/submit", authenticateUser, submitFeedback);
router.get("/questions", authenticateUser, getQuestions); 
router.get("/assignments", authenticateUser, getAssignedSubjects);

module.exports = router;
