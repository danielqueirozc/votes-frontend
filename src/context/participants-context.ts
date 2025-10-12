import { createContext } from 'react'
import type { ParticipantsContextType } from './participants-provider'


export const ParticipantsContext = createContext<ParticipantsContextType | undefined>(undefined)
