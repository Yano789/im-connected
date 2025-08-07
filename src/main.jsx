import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App.jsx'
import "./il8n.js"

// Only load locator in development
if (import.meta.env.DEV) {
  import("@locator/runtime").then(({ default: setupLocatorUI }) => {
    setupLocatorUI();
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App/>
  </StrictMode>,
)
