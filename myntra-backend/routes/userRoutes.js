const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protected Route: Get User Profile
router.get("/profile", authMiddleware, (req, res) => {
    db.query("SELECT id, name, email FROM users WHERE id = ?", [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(results[0]);
    });
});

module.exports = router;
