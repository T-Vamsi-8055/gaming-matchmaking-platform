import React from 'react'
import {useState,useEffect} from 'react'
import {useLocation,useNavigate} from 'react-router-dom'
import {socket} from "./socket";

const API_PORT= 3000
export default function otpVerify(){
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

        const response = await fetch(
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
      const response = await fetch(`http://localhost:${API_PORT}/api/auth/verify-otp`, {
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
    <div className="flex flex-col gap-3 justify-center items-center w-screen mx-auto bg-blue-200 text-2xl p-6 ">
      {errorMsg && <h3 className='text-red-500'>{errorMsg}</h3>}
      <h1 className="m-5 ">Enter the 6-digit access token sent to {state?.email}:</h1>
      <form onSubmit={(e)=>submitForm(e)} className='flex flex-col'>
        <div>{formData.map((digit,i)=>(<input
    key={i}
    type="text"
    inputMode="numeric"
    maxLength={1}
    value={digit}
    placeholder="_"
    className="rounded-xl bg-blue-300 p-2.5 m-1 w-10"

    onChange={(e)=>{

        const value = e.target.value.replace(/\D/g,"");

        const otp=[...formData];

        otp[i]=value;

        setFormData(otp);

        if(value && e.target.nextSibling){

            e.target.nextSibling.focus();

        }

    }}

    onKeyDown={(e)=>{

        if(e.key==="Backspace" && !formData[i]){

            if(e.target.previousSibling){

                e.target.previousSibling.focus();

            }

        }

    }}
/>))
        }</div>
        <br />
        <button 
        type="submit" 
        className='rounded-xl 
        bg-blue-400 p-2'>Submit</button>
      </form>
      
        <h2>{timeLeft>0?('Timer: '+Math.floor(timeLeft/60)+":"+((timeLeft%60)<10?("0"+timeLeft%60):(timeLeft%60))):'You can use the resend Btn:'}</h2>
        
        
        {resendBtn ?<button 
        onClick={handleClickResend}
        className='rounded-xl 
        bg-blue-400 p-2 '>Resend</button>:<h3>Wait for the resend button</h3>}
    </div>
  )
}

