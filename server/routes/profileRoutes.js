import {Router} from "express";

import {upload} from "../middlewares/upload.js";
import {updateProfile} from "../controllers/profile.controller.js"

const route=Router();
import {handleUserProfileUpdate,handleGetUserProfile} from "../controllers/authController.js"

route.get("/",
    handleGetUserProfile
)

route.put("/",upload.single("profilePic"),
    handleUserProfileUpdate
)



export {route};