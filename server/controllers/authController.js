import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";

import { generateOTP } from "../utils/generateOTP.js";
import { generateToken } from "../utils/generateToken.js";
import { sendOTPEmail } from "../utils/sendOTPEmail.js";
import dotenv from "dotenv"

async function handleAuthLogin(req, res) {
    const { email, password } = req.body;

    try {

        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Internal server error",
        });

    }
}
async function handleAuthRegister(req, res) {

    const { username, email, password } = req.body;

    try {

        const existing = await pool.query(
            "SELECT id FROM users WHERE email=$1",
            [email]
        );

        if (existing.rowCount > 0) {

            return res.status(400).json({
                message: "User already exists"
            });

        }

        const otp = generateOTP();

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `
            INSERT INTO pending_users
            (
                username,
                email,
                password_hash,
                otp,
                expires_at
            )

            VALUES

            ($1,$2,$3,$4,NOW()+INTERVAL '5 minutes')

            ON CONFLICT(email)

            DO UPDATE SET

                username=EXCLUDED.username,
                password_hash=EXCLUDED.password_hash,
                otp=EXCLUDED.otp,
                expires_at=EXCLUDED.expires_at,
                created_at=NOW()
            `,
            [
                username,
                email,
                hashedPassword,
                otp
            ]
        );

        await sendOTPEmail(email, otp);

        return res.status(200).json({
            message: "OTP sent"
        });

    }
    catch(err){

        console.error(err);

        return res.status(500).json({
            message:"Internal server error"
        });

    }

}
async function handleAuthMe(req, res) {

    try {

        const token = req.cookies.token;

        if (!token) {

            return res.status(401).json({
                message: "Not authenticated",
            });

        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const result = await pool.query(
            `
            SELECT id,
                   username,
                   email
            FROM users
            WHERE id=$1
            `,
            [decoded.id]
        );

        if (result.rowCount === 0) {

            return res.status(404).json({
                message: "User not found",
            });

        }

        return res.json(result.rows[0]);

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token",
        });

    }

}
async function handleOtpVerify(req,res){

    const client = await pool.connect();

    const {email,otp}=req.body;

    try{

        await client.query("BEGIN");

        const pending = await client.query(
            `
            SELECT *

            FROM pending_users

            WHERE email=$1
            AND otp=$2
            AND expires_at>NOW()
            `,
            [email,otp]
        );

        if(pending.rowCount===0){

            await client.query("ROLLBACK");

            return res.status(400).json({
                message:"Invalid or expired OTP"
            });

        }

        const user = pending.rows[0];

        const userId=await client.query(
            `
            INSERT INTO users
            (
                username,
                email,
                password_hash
            )

            VALUES
            ($1,$2,$3) RETURNING id
            `,
            [
                user.username,
                user.email,
                user.password_hash
            ]
        );

        await client.query(
            `
            DELETE FROM pending_users
            WHERE email=$1
            `,
            [email]
        );

        await client.query("COMMIT");
        const token = generateToken({id:userId.rows[0].id,email:user.email});

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Account created and Login successful",
            username:user.username,
            token
        });
        

    }
    catch(err){

        await client.query("ROLLBACK");

        console.error(err);

        return res.status(500).json({
            message:"Internal server error"
        });

    }
    finally{

        client.release();

    }

}
async function handleResendOTP(req, res) {

    const { email } = req.body;

    try {

        const pending = await pool.query(
            `
            SELECT id

            FROM pending_users

            WHERE email=$1
            `,
            [email]
        );

        if (pending.rowCount === 0) {

            return res.status(404).json({
                message: "Registration not found"
            });

        }

        const otp = generateOTP();

        await pool.query(
            `
            UPDATE pending_users

            SET

            otp=$1,

            expires_at=NOW()+INTERVAL '5 minutes',

            created_at=NOW()

            WHERE email=$2
            `,
            [
                otp,
                email
            ]
        );

        await sendOTPEmail(email, otp);

        return res.json({
            message: "OTP resent successfully"
        });

    }
    catch(err){

        console.error(err);

        return res.status(500).json({
            message:"Internal server error"
        });

    }

}

export {
    handleAuthLogin,
    handleAuthRegister,
    handleOtpVerify,
    handleAuthMe,
    handleResendOTP
};