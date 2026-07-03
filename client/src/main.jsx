import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import USERLOGANDREG from './USERLOGANDREG.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <USERLOGANDREG />
  </StrictMode>,
)