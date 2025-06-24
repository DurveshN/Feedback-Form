const express = require("express");
const { addHOD, getAllHODs, updateHOD, deleteHOD } = require("../controllers/hodController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", authenticateUser, addHOD);
router.get("/all", authenticateUser, getAllHODs);
router.put("/update/:id", authenticateUser, updateHOD);
router.delete("/delete/:id", authenticateUser, deleteHOD);

module.exports = router;
