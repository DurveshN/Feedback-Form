const pool = require("../config/db");

// ✅ Add HOD
exports.addHOD = async (req, res) => {
    try {
        const { name, department_id } = req.body;

        const query = `INSERT INTO hod (name, department_id) VALUES ($1, $2) RETURNING *;`;
        const { rows } = await pool.query(query, [name, department_id]);

        res.status(201).json({ success: true, hod: rows[0] });
    } catch (error) {
        console.error("Error adding HOD:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Get all HODs
exports.getAllHODs = async (req, res) => {
    try {
        const query = `SELECT * FROM hod;`;
        const { rows } = await pool.query(query);

        res.status(200).json({ success: true, hods: rows });
    } catch (error) {
        console.error("Error fetching HODs:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Update HOD
exports.updateHOD = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const query = `UPDATE hod SET name = $1 WHERE id = $2 RETURNING *;`;
        const { rows } = await pool.query(query, [name, id]);

        res.status(200).json({ success: true, hod: rows[0] });
    } catch (error) {
        console.error("Error updating HOD:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Delete HOD
exports.deleteHOD = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `DELETE FROM hod WHERE id = $1 RETURNING *;`;
        const { rows } = await pool.query(query, [id]);

        res.status(200).json({ success: true, message: "HOD deleted successfully", hod: rows[0] });
    } catch (error) {
        console.error("Error deleting HOD:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
