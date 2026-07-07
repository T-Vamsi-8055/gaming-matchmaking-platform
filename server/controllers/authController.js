import bcrypt from "bcrypt";
import { pool } from "../config/db.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

async function handleAuthLogin(req, res) {
    const { email, password } = req.body;
    try {
        const ans = await pool.query("select * from users where email=$1", [email]);
        const user = ans.rows[0];
        if (ans.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            ans.rows[0].password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,      // true in production with HTTPS
            sameSite: "lax"
        });
        res.status(200).json({
            message: "Login successful"
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
async function handleAuthRegister(req, res) {
    const { username, email, password } = req.body;
    try {
        const ans = await pool.query("select * from users where email=$1", [email]);
        if (ans.rows[0]) {
            res.send("User already exists");
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newuser = await pool.query("insert into users (username,email,password_hash) values ($1,$2,$3)", [username, email, hashedPassword]);
            res.status(201).json({ message: "User created" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Internal server error" });
    }

}

export { handleAuthLogin, handleAuthRegister };