const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const {
  generateStudentLoginPDF,
  deleteUsedLogins
} = require("../controllers/studentLoginPdfController");

const router = express.Router();

router.post("/generate-pdf", authenticateUser, generateStudentLoginPDF);
router.delete("/delete-login", authenticateUser, deleteUsedLogins);
module.exports = router;
