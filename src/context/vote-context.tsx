import { VoteService } from "@/lib/axios";
import { createContext, use, useCallback, useContext, useState } from "react";


interface ParticipantsType {
 participant: {
    id: string
    name: string
    imageUrl: string
 }
}
interface VoteType {
  id?: string
  createdAt?: Date
  title: string
  participantIds: string[]
  participants?: ParticipantsType[]
}

interface Link {
  link: string
  newVote: VoteType
}

interface VoteContextType {
  List: () => Promise<void>
  ListById: (id: string) => Promise<void>
  Create: ({ title, participantIds }: VoteType) => Promise<Link>
  Delete: () => Promise<void>
  votes: VoteType[]
  voteData: VoteType | null
  lastCreatedVoteLink: string | null
}

export const VoteContext = createContext({} as VoteContextType)

export function VoteProvider({ children }: { children: React.ReactNode }) {
  const [ votes, setVotes ] = useState<VoteType[]>([])
  const [ lastCreatedVoteLink, setLastCreatedVoteLink ] = useState<string | null>(null)
  const [voteData, setVoteData ] = useState<VoteType | null>(null)

  const Create = useCallback(async ({ title, participantIds }: VoteType): Promise<Link> => {
        const response = await VoteService.create({ title, participantIds })

        console.log("🔎 Response do backend:", response.data)

        const newVote = response.vote

        setVotes(prev => [...prev, newVote])

        // verifica se estamos no browser ou servidor
        const origin = typeof window !== 'undefined' ? window.location.origin :
        process.env.NEXT_PUBLIC_VERCEL_URL ?? "" 

        // gera o link
        const link = `${origin}/votacao/${newVote.id}`

        // salva o ultimo link criado
        setLastCreatedVoteLink(link)

        return { link, newVote }
      }, [])

  const List = useCallback(async () => {
      const response = await VoteService.list()
      setVotes(response.data.votes)
    }, [])


    const ListById = useCallback(async (id: string) => {
      try {
        const response = await VoteService.listById(id)
        console.log('🔎 Response do backend:', response.data.vote)
        setVoteData(response.data.vote)
      } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error)
      }
    }, [])

    const Delete = async () => {
      await VoteService.delete()
      setVotes([])
    }

  return (
    <VoteContext.Provider value={{ List, ListById, voteData, Create, votes, Delete, lastCreatedVoteLink }}>
      {children}
    </VoteContext.Provider>
  )
}

export function UseVote() {
  return useContext(VoteContext)
}