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

        setLoading(true);
        console.log(`Frontend is ready. Sending code "${finalOtp}" for email: ${email}`);

        /* PLACEHOLDER FOR SERVER BACKEND INTEGRATION
         DROP THE FETCH API REQUEST HERE
        */
    
        setTimeout(() => {
            setLoading(false);
            // On successful verification, move to profile setup:
            navigate("/auth/profile-setup");
        }, 1500);
    };
    
    // Resetting the layout when requesting a new token
    const handleResend = () => {
        setError("");
        setTimer(30); // Reset countdown
        setOtp(new Array(6).fill("")); // Clear layout boxes
        if (inputRefs.current[0]) inputRefs.current[0].focus(); // Refocus first box safely
        console.log("User requested a code resend.");
        // Server to trigger resend logic here
    };

  return (
    <section style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "450px", padding: "20px" }}>
        
        <header>
          <h2>Security Verification</h2>
          <p>Please provide the 6-digit access token sent to: <strong>{email}</strong></p>
        </header>

        {error && (
          <div style={{ color: "red", marginBottom: "15px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Box Container */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "25px" }}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                ref={(el) => (inputRefs.current[index] = el)}
                disabled={loading} // Changed to matching variable name: loading
                style={{ width: "50px", height: "50px", textAlign: "center", fontSize: "1.5rem" }}
              />
            ))}
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px 0" }}>
            {loading ? "Verifying Code..." : "Submit Verification"}
          </button>
        </form>

        <footer style={{ marginTop: "20px", textAlign: "center" }}>
          {timer > 0 ? (
            <p>Resend code in {timer}s</p>
          ) : (
            <button type="button" onClick={handleResend}>
              Resend OTP Code
            </button>
          )}
        </footer>
      </div>
    </section>
  );
}