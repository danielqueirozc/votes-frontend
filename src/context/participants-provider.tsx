import { api, ParticipantService } from "@/lib/axios";
import { useCallback, useState } from "react";
import { ParticipantsContext } from "./participants-context";

interface RegisterType {
  name: string,
  email: string,
  password: string
}

interface ParticipantType {
  id: string,
  name: string,
  imageUrl: string
}

interface CreateParticipantType {
  name: string,
  imageUrl: string
}

interface EditParticipantType {
  data: {
    name: string,
    imageUrl: string
  }
}


export interface ParticipantsContextType {
  participants: ParticipantType[],
  setParticipants: React.Dispatch<React.SetStateAction<ParticipantType[]>>
  CreateParticipant: ({ name, imageUrl }: CreateParticipantType) => Promise<void>
  ListParticipants: () => Promise<void>
  DeleteParticipant: (id: string) => Promise<void>
  EditParticipant: (id: string, data: EditParticipantType) => Promise<void>
  Register: ({ name, email, password }: RegisterType) => Promise<void>
}


export function ParticipantsProvider({ children }: { children: React.ReactNode }) {
    const [participants, setParticipants] = useState<ParticipantType[]>([])

    async function CreateParticipant({ name, imageUrl }: CreateParticipantType) {
      const response = await api.post('create-participant', { name, imageUrl })

      setParticipants(state => [...state, response.data])
    }

   const ListParticipants = useCallback(async () => {
      const response = await api.get('list-participants')

      setParticipants(response.data.participants)
   }, [])

    async function DeleteParticipant(id: string ) {
      await ParticipantService.delete(id)
      setParticipants(state => state.filter(participant => participant.id !== id))
    }

    async function EditParticipant(id: string, data: EditParticipantType) {
      await api.put(`edit-participant/${id}`, data)
      setParticipants(state => state.map(participant => participant.id === id ? { ...participant, ...data } : participant))
    }

    async function Register({ name, email, password }: RegisterType) {
      await api.post('users', { name, email, password })
    }

    return (
        <ParticipantsContext.Provider value={{ participants, setParticipants, CreateParticipant, ListParticipants, DeleteParticipant, EditParticipant, Register }}>
            {children}
        </ParticipantsContext.Provider>
    )
} 

