import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { ParticipantsProvider } from './context/participants-provider.tsx'
import { AuthContextProvider } from './context/auth-context.tsx'
import { VoteProvider } from './context/vote-context.tsx'
import { WebSocketProvider } from './context/websocket-context.tsx'
import { UserVotesProvider } from './context/user-votes-context.tsx'

createRoot(document.getElementById('root')!).render(
<AuthContextProvider>
  <VoteProvider>
    <ParticipantsProvider>
     <WebSocketProvider>
      <UserVotesProvider>
      <StrictMode>
        <App />
      </StrictMode>
      </UserVotesProvider>
     </WebSocketProvider>
    </ParticipantsProvider>
   </VoteProvider>
</AuthContextProvider>
)
