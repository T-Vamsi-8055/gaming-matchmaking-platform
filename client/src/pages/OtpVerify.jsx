import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {socket} from "../services/socket";
import { API_PORT } from "../utils/constants";
import { Button } from "../components/common";
import { apiFetch } from '../utils/apiFetch';

export default function OtpVerify(){
    const [formData,setFormData]=useState(["","","","","",""])
    const [resendBtn, setResendBtn] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    const {state} =useLocation();
    const navigate=useNavigate();
    const [errorMsg,setErrorMsg]=useState("");
useEffect(() => {
  const id = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(id);
        setResendBtn(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(id);
}, [resendBtn]);

    
  const handleClickResend = async () => {

    try {

        const response = await apiFetch(
            `http://localhost:${API_PORT}/api/auth/resend-otp`,
            {
                method: "POST",
                headers: {
                    "Content-Type":"application/json"
                },
                credentials:"include",
                body: JSON.stringify({
                    email: state.email
                })
            }
        );

        const data = await response.json();

        if(!response.ok){

            setErrorMsg(data.message);

            return;

        }

        setTimeLeft(120);

        setResendBtn(false);

        setErrorMsg("");

    }
    catch(err){

        console.error(err);

    }

}
  const submitForm=async (e)=>{
    e.preventDefault();
    try {
const Data = {
    email: state.email,
    otp: formData.join("")
};
      const response = await apiFetch(`http://localhost:${API_PORT}/api/auth/verify-otp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Data),
      });

      const data = await response.json();
      //console.log(data);
     if(response.ok){
  alert("Account created successfully! Let's set up your profile.");
  

  const usernameToSave = data.username || data.user?.username || "New User";
  localStorage.setItem('registeredName', usernameToSave);
  localStorage.setItem('jwt-auth-token', data.token);
  if (socket.connected) {
    socket.disconnect();
  }
  socket.auth={
    token:data.token
  }
  socket.connect();
  navigate("/profile");      
}else{
        setErrorMsg(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  }
  if (!state?.email) {
    navigate("/auth");
    return null;
}
  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 flex flex-col items-center justify-center font-sans select-none overflow-hidden p-4 relative w-full">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 text-center">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            Security Verification
          </h1>
          <p className="text-sm text-zinc-400">
            Enter the 6-digit OTP sent to:
            <br />
            <span className="text-cyan-400 font-semibold font-mono text-xs">{state?.email}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs py-2 px-3 rounded-lg font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={submitForm} className="space-y-6 flex flex-col items-center">
          <div className="flex justify-center gap-2">
            {formData.map((digit, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                placeholder="•"
                className="w-12 h-12 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white rounded-xl text-center text-xl font-bold font-mono outline-none transition-all"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  const otp = [...formData];
                  otp[i] = value;
                  setFormData(otp);
                  if (value && e.target.nextSibling) {
                    e.target.nextSibling.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !formData[i]) {
                    if (e.target.previousSibling) {
                      e.target.previousSibling.focus();
                    }
                  }
                }}
              />
            ))}
          </div>

          <Button type="submit" variant="primary" className="w-full py-3.5">
            Verify OTP
          </Button>
        </form>

        <div className="pt-2 border-t border-zinc-800/50 flex flex-col items-center gap-3">
          <div className="text-xs text-zinc-400">
            {timeLeft > 0 ? (
              <span className="font-mono">Resend available in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            ) : (
              <span>You can now request a new OTP</span>
            )}
          </div>

          {resendBtn ? (
            <Button onClick={handleClickResend} variant="secondary" className="w-full py-2 text-xs">
              Resend OTP
            </Button>
          ) : (
            <span className="text-xs text-zinc-600 font-semibold uppercase tracking-wider">
              OTP Resent
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

