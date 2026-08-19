import express from "express";
const route=express.Router();
import {handleAuthLogin,  handleAuthRegister, handleAuthMe ,handleResendOTP,handleOtpVerify,handleRefreshToken,handleDeleteAccount} from "../controllers/authController.js"

route.post("/login",
    handleAuthLogin
)

route.post("/register",
    handleAuthRegister
)

route.post("/verify-otp",
    handleOtpVerify
)
route.get("/me",
    handleAuthMe
)
route.post("/refreshToken",
    handleRefreshToken
)
route.post(
    "/resend-otp",
    handleResendOTP
);
route.post(
    "/delete-account",
    handleDeleteAccount
);
export {route};