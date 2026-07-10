import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Login from './auth/isLogin.jsx' 
import Home from './home.jsx' 
import {  BrowserRouter,Routes,Route } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Login />}></Route>
        <Route path="/" element={<Home />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)