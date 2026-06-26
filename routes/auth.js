import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res, next) => {
    const { username, email, mobile, password } = req.body;
    if (!username || !email || !mobile || !password) {
        return res.status(400).json({ message: "Must fill the all required fields" });
    }

    try{
        const [existingUser] = await pool.query("SELECT * from users WHERE email = ? OR username = ?", [email, username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query("INSERT INTO users (username, email, mobile, password) VALUES (?, ?, ?, ?)", [username, email, mobile, hashedPassword]);
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try{
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET || "jwt_secret_key", 
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "User logged in successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
         });
    } catch (error) {
        next(error);
    }
});

export default router;
