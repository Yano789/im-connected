import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import setupLocatorUI from "@locator/runtime";
import { BrowserRouter } from 'react-router-dom';

import './index.css'
import App from './App.jsx'
setupLocatorUI()
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </StrictMode>,
)
