import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_PORT = 3000;

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();

    // Extract user info passed from the registration page state (if available)
    const email = location.state?.email || ""; 

    // Core component states
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [timer, setTimer] = useState(30); 
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    
    // Refs to control focus shifting between input boxes
    const inputRefs = useRef([]);
    
    //Form submission handling
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        const finalOtp = otp.join("");

        // Frontend validation check
        if (finalOtp.length < 6) {
            setError("Please fill out all 6 digits of your verification code.");
            return;
        }

        // Set to loading state to simulate a backend process starting
        setIsLoading(true);
        console.log(`Frontend is ready. Sending code "${finalOtp}" for email: ${email}`);

    
        /* PLACEHOLDER FOR SERVERBACKEND INTEGRATION
         DROP THE FETCH API REQUEST HERE
        */
    
        setTimeout(() => {
             setIsLoading(false);
            // On successful verification, move to profile setup:
            // navigate("");
        }, 1500);
    };
    
    // Resetting the layout when requesting a new token
    const handleResend = () => {
        setError("");
        setOtp(new Array(6).fill("")); // Clear layout boxes
        inputRefs.current[0].focus(); // Refocus first box
        console.log("User requested a code resend.");
        // Server to trigger resend logic here
    };

}