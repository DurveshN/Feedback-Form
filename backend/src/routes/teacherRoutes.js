const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const teacherController = require("../controllers/teacherController");

router.get("/", authenticateUser, teacherController.getAllTeachers);
router.post("/", authenticateUser, teacherController.addTeacher);

module.exports = router;
