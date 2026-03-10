import { VoteService } from "@/lib/axios";
import { api } from "@/lib/axios";
import { createContext, useCallback, useContext, useState } from "react";

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
  status?: 'ACTIVE' | 'CLOSED'
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
  CloseVote: (voteId: string) => Promise<void> // ✅ Nova função
  votes: VoteType[]
  voteData: VoteType | null
  lastCreatedVoteLink: string | null
}

export const VoteContext = createContext({} as VoteContextType)

export function VoteProvider({ children }: { children: React.ReactNode }) {
  const [votes, setVotes] = useState<VoteType[]>([])
  const [lastCreatedVoteLink, setLastCreatedVoteLink] = useState<string | null>(null)
  const [voteData, setVoteData] = useState<VoteType | null>(null)

  const Create = useCallback(async ({ title, participantIds }: VoteType): Promise<Link> => {
    const response = await VoteService.create({ title, participantIds })

    const newVote = response.vote

    // verifica se estamos no browser ou servidor
    const origin = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_VERCEL_URL ?? ""

    // gera o link
    const link = `${origin}/votacao/${newVote.id}`

    // salva o ultimo link criado
    setLastCreatedVoteLink(link)

    // salva também no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentVoteLink', link)
    }

    return { link, newVote }
  }, [])

  const List = useCallback(async () => {
    const response = await VoteService.list()

    setVotes(response.data.votes)
  }, [])

  const ListById = useCallback(async (id: string) => {
    try {
      const response = await VoteService.listById(id)
      
      setVoteData(response.data.vote)
    } catch (error) {

      throw error
    }
  }, [])

  // encerrar votação
  const CloseVote = useCallback(async (voteId: string) => {
    try {
      await api.post(`/vote/${voteId}/close`)
      
      // atualiza o voteData local
      setVoteData(prev => {
        if (prev && prev.id === voteId) {
          return { ...prev, status: 'CLOSED' }
        }
        return prev
      })
      
      // atualiza a lista de votos se estiver carregada
      setVotes(prev => 
        prev.map(vote => 
          vote.id === voteId 
            ? { ...vote, status: 'CLOSED' as const }
            : vote
        )
      )
      
    } catch (error) {
      
      throw error
    }
  }, [])

  const Delete = useCallback(async () => {
    await VoteService.delete()
    setVotes([])
  }, [])

  return (
    <VoteContext.Provider value={{ 
      List, 
      ListById, 
      voteData, 
      Create, 
      votes, 
      Delete, 
      CloseVote,
      lastCreatedVoteLink 
    }}>
      {children}
    </VoteContext.Provider>
  )
}

export function UseVote() {
  const context = useContext(VoteContext)
  
  if (!context) {
    throw new Error('UseVote deve ser usado dentro de VoteProvider')
  }
  
  return context
}