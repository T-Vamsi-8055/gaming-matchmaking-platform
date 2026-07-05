import express from "express";
const route=express.Router();
import {handleAuthLogin,  handleAuthRegister } from "../controllers/authController.js"

route.post("/login",
    handleAuthLogin
)

route.post("/register",
    handleAuthRegister
)

export {route};