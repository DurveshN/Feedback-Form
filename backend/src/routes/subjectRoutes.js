const express = require("express");
const { addSubject, getSubjects } = require("../controllers/subjectController");
const { authenticateUser } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authenticateUser, getSubjects);
router.post("/", authenticateUser, addSubject);

module.exports = router;
