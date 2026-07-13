import {Router} from "express";

import {upload} from "../middlewares/upload.js";

const route=Router();
import {handleUserProfileUpdate,handleGetUserProfile} from "../controllers/updateProfile.js"
import { verifyJWT } from "../middlewares/authMiddleware.js";

route.get(
    "/",
    verifyJWT,
    handleGetUserProfile
);

route.put(
    "/",
    verifyJWT,
    upload.single("profilePic"),
    handleUserProfileUpdate
);
export {route};