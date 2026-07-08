import React,{useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

const API_PORT=3000
const response=await fetch(`http://localhost:${API_PORT}/api/auth/me`,{
        credentials:"include"
    });
const user=await response?.json();
const home = () => {
    const navigate=useNavigate();
    

    useEffect(()=>{
        if(!response.ok){
            navigate("/auth")
        }
    },[response,navigate])
  return (
    <div>
      <p>Hi {user.username}</p>
    </div>
  )
}

export default home
