import express from "express";
const route=express.Router();
import {handleUserProfileUpdate,handleUserProfileCreate,handleGetUserProfile} from "../controllers/authController.js"

route.get("/",
    handleGetUserProfile
)

route.put("/",
    handleUserProfileUpdate
)

route.post("/",
    handleUserProfileCreate
)

export {route};