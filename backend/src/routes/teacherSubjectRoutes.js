const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  getAllLinks,
  createLink,
  updateLink,
  getSubjects,
  getTeachers
} = require("../controllers/teacherSubjectController");

const router = express.Router();
  
// HOD functionality
router.get("/list", authenticateUser, getAllLinks);
router.post("/link", authenticateUser, createLink);
router.put("/update/:id", authenticateUser, updateLink);

// fetch subjects and teachers
router.get("/subjects", authenticateUser, getSubjects);
router.get("/teachers", authenticateUser, getTeachers);

module.exports = router;
