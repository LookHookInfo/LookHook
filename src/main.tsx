import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "preline/preline"
import './index.css'
import App from './App.tsx'
import { ThirdwebProvider } from "thirdweb/react";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThirdwebProvider>
      <App />
    </ThirdwebProvider>
  </StrictMode>,
)