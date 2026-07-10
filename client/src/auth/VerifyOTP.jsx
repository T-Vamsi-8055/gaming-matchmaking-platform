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
 
}