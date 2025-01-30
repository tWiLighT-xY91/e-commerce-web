const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
require("dotenv").config();


const router = express.Router();

// User Registration (Signup)
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
            if (results.length > 0) {
                return res.status(400).json({ message: "User already exists" });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into database
            db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
                [name, email, hashedPassword], 
                (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: "Database error", error: err });
                    }
                    res.status(201).json({ message: "User registered successfully" });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// User Login Route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) {
          return res.status(500).json({ message: "Server error" });
      }
      if (results.length === 0) {
          return res.status(400).json({ message: "User not found" });
      }

      const user = results[0];

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT Token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

      res.json({ message: "Login successful", token });
  });
});


module.exports = router;

