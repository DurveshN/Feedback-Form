const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");

// Route to get all departments
router.get("/", departmentController.getAllDepartments);

// Route to add a new department
router.post("/", departmentController.addDepartment);

// Route to delete a department
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
