import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "preline/preline"
import './index.css'
import App from './App.tsx'
import { ThirdwebProvider } from "thirdweb/react";
import { client } from "./lib/thirdweb/client";
import { chain } from "./lib/thirdweb/chain";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThirdwebProvider client={client} activeChain={chain}>
      <App />
    </ThirdwebProvider>
  </StrictMode>,
)