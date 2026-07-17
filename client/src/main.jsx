import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './isLogin.jsx'
import Home from './home.jsx' 
import QueueScreen from './queueScreen.jsx' 
import Profile from './profile.jsx'
import OtpVerify from "./otpVerify.jsx";

import {  BrowserRouter,Routes,Route } from 'react-router-dom';
import Match from './match.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/auth" element={<Login />}></Route>
        <Route path="/otpVerify" element={<OtpVerify />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path="/queueScreen" element={<QueueScreen />}></Route>
        <Route path="/match" element={<Match />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)