import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { ParticipantsProvider } from './context/participants-provider.tsx'
import { AuthContextProvider } from './context/auth-context.tsx'
import { VoteProvider } from './context/vote-context.tsx'

createRoot(document.getElementById('root')!).render(
<AuthContextProvider>
  <VoteProvider>
    <ParticipantsProvider>
      <StrictMode>
        <App />
      </StrictMode>,
    </ParticipantsProvider>
   </VoteProvider>
</AuthContextProvider>
)
