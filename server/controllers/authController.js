import bcrypt from "bcrypt";
import pool from "../config/db"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

async function handleAuthLogin(req,res){
    const {email, password} =req.body;
    try{
    const ans=pool.query("select * from users where email=$1",[email]);

    if(!ans.rows[0]) res.send("Invalid email or password.");

    await bcrypt.compare(password,ans.rows[0].password_hash);
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
    req.cookie("token",token);
    res.redirect("/");
    
    }catch(err){
        console.log(err);
    }
}
async function handleAuthRegister(req,res){
    const {username,email, password} =req.body;
    try{
    const ans=await pool.query("select * from users where email=$1",[email]);
    if(ans.rows[0]){
        res.send("User already exists");
    }else{
        const hashedPassword = await bcrypt.hash(password, 10);
        const newuser=pool.query("insert into users (username,email,password_hash,created_at,updated_at) values ($1,$2,$3)",[username,email,hashedPassword]);
        res.status(201).send("User created");
    }
    }catch(err){
        console.log(err);
    }

}

export { handleAuthLogin, handleAuthRegister };