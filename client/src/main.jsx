import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/index.css'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx' 
import QueueScreen from './pages/QueueScreen.jsx' 
import Profile from './pages/Profile.jsx'
import OtpVerify from "./pages/OtpVerify.jsx";
import Party from './pages/Party.jsx'
import PartyRoom from './pages/PartyRoom.jsx'

import {  BrowserRouter,Routes,Route } from 'react-router-dom';
import Match from './pages/Match.jsx'

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
        <Route path="/party" element={<Party />}></Route>
        <Route path="/party/:id" element={<PartyRoom />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)