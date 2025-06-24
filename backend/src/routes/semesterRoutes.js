const express = require("express");
const {
  updateSemester,
  toggleFeedback,
  getCurrentSemesterInfo
} = require("../controllers/semesterController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/update", authenticateUser, updateSemester);
router.put("/feedback-toggle", authenticateUser, toggleFeedback);
router.get("/current", authenticateUser, getCurrentSemesterInfo); // ✅ Now works

module.exports = router;
