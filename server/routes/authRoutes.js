import express from "express";
const route=express.Router;
import {handleAuthLogin,  handleAuthRegister } from "../controllers/authController"

route.post("/login",async (req,res)=>{
    handleAuthLogin(req,res);
})

route.post("/register",async (req,res)=>{
    handleAuthRegister(req,res);
})

export {route};