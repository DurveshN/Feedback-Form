const pool = require("../config/db");

// ✅ Fetch all questions
exports.getQuestions = async (req, res) => {
    try {
        const query = `
            SELECT id, text, type 
            FROM questions
            ORDER BY id ASC;
        `;

        const { rows } = await pool.query(query);

        res.status(200).json({ success: true, questions: rows });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
