import { UserVotesService } from '@/lib/axios'
import { createContext, useContext, useCallback  } from 'react'


interface UserVotesContextType {
  createUserVote: (voteId: string, participantId: string) => Promise<void>
  getVoteCounts: (participantId: string) => Promise<number>
}

const UserVotesContext = createContext<UserVotesContextType>({} as UserVotesContextType)

export function UserVotesProvider({ children }: { children: React.ReactNode }) {
  const createUserVote = useCallback(async ( voteId: string, participantId: string) => {
    const response = await UserVotesService.create( voteId, participantId)

    return response.data
}, [])

  const getVoteCounts = useCallback(async (participantId: string): Promise<number> => {
    const response = await UserVotesService.getVoteCounts(participantId)

    return response.data
  }, [])

  return (
    <UserVotesContext.Provider value={{ createUserVote, getVoteCounts }}>
      {children}
    </UserVotesContext.Provider>
  )
}

export function useUserVotes() {
  const context = useContext(UserVotesContext)

  if (!context) {
    throw new Error('useUserVotes deve ser usado dentro de UserVotesProvider')
  }

  return context
}