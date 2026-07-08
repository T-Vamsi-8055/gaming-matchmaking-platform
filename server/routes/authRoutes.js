import express from "express";
const route=express.Router();
import {handleAuthLogin,  handleAuthRegister, handleAuthMe } from "../controllers/authController.js"

route.post("/login",
    handleAuthLogin
)

route.post("/register",
    handleAuthRegister
)

route.get("/me",
    handleAuthMe
)
export {route};