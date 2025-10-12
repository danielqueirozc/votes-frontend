import { useContext } from "react"
import { ParticipantsContext } from "./participants-context"

export function useParticipants() {
    const context = useContext(ParticipantsContext)

    if (!context) {
        throw new Error('useParticipants must be used within a ParticipantsProvider')
    }

    return context
  }