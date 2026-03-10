import { VoteService } from "@/lib/axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useWebSocket } from '@/context/websocket-context';
import { api } from "@/lib/axios";

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
  title?: string
  participants: ParticipantsType[]
}

// ✅ Função para gerar/recuperar ID anônimo
function getAnonymousId(voteId: string): string {
  const storageKey = `anonymous_vote_${voteId}`
  
  // tenta recuperar ID existente
  let anonymousId = localStorage.getItem(storageKey)
  
  // se não existe, cria um novo
  if (!anonymousId) {
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(storageKey, anonymousId)
  }
  
  return anonymousId
}

export function Eliminate() {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null)
  const [selectedParticipantName, setSelectedParticipantName] = useState<string | null>(null)
  const [confirmedVote, setConfirmedVote] = useState<boolean>(false)
  const [voteData, setVoteData] = useState<VoteType | null>(null)
  const [isVoting, setIsVoting] = useState<boolean>(false)
  const [isVoteClosed, setIsVoteClosed] = useState<boolean>(false) // ✅ Estado de encerramento

  const { id } = useParams()
  const { lastMessage } = useWebSocket()
  
  // carregar dados iniciais
  useEffect(() => {
    if (!id) return
    
    VoteService.listById(id).then((response) => {
      setVoteData(response.data.vote)
      console.log('📊 Dados do voto carregados:', response.data.vote)
      
      // verifica se a votação está encerrada
      if (response.data.vote.status === 'CLOSED') {
        setIsVoteClosed(true)
      }
    }).catch((error) => {
      console.error('❌ Erro ao carregar voto:', error)
    })
  }, [id])

  // escutar atualizações do WebSocket
  useEffect(() => {
    if (!lastMessage) return
    
    // atualização de votos
    if (lastMessage.event === 'vote_update') {
      const data = lastMessage.data
      console.log('📩 Atualização recebida via WebSocket:', data)
      
      if (data.voteId === id) {
        setVoteData(prevData => {
          if (!prevData) return prevData
          
          return {
            ...prevData,
            participants: data.participants
          }
        })
        
      }
    }
    
    // ✅ Votação encerrada
    if (lastMessage.event === 'vote_closed') {
      const data = lastMessage.data
      
      if (data.voteId === id) {
        setIsVoteClosed(true)
      }
    }
  }, [lastMessage, id])

  function handleClickVote(participantId: string, participantName: string) {
    if (confirmedVote) return
    
    setSelectedParticipantId(participantId)
    setSelectedParticipantName(participantName)
  }

  async function handleConfirmedVote() {
    if (!selectedParticipantName || !selectedParticipantId || !id) return
    if (confirmedVote || isVoting) return

    setIsVoting(true)

    try {
      // gera/recupera ID anônimo
      const anonymousId = getAnonymousId(id)
      
      // envia voto (com ou sem autenticação)
      await api.post('/vote', {
        voteId: id,
        participantId: selectedParticipantId,
        anonymousId // sempre envia, backend decide se usa ou não
      })
      
      // ✅ Marca como confirmado
      setConfirmedVote(true)
      console.log('✅ Voto confirmado com sucesso!')
      
    } catch (error: any) {
      // verifica o tipo de erro
      if (error.response?.status === 409) {
        alert('Você já votou nesta votação!')
        setConfirmedVote(true) // bloqueia nova tentativa
      } else if (error.response?.status === 401) {
        alert('Erro de autenticação. Tente novamente.')
      } else {
        alert('Erro ao registrar voto. Tente novamente.')
        // reseta apenas em caso de erro genérico
        setSelectedParticipantId(null)
        setSelectedParticipantName(null)
      }
      
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <section className="flex flex-col items-center gap-4 mt-6">
      {/* ✅ Banner de votação encerrada */}
      {isVoteClosed && (
        <div className="w-full bg-red-500 text-white py-4 px-6 text-center font-bold text-lg rounded-lg">
          🔒 VOTAÇÃO ENCERRADA - Não é mais possível votar
        </div>
      )}
      
      {confirmedVote && !isVoteClosed && (
        <div className="flex justify-start gap-1 w-full">
          <img src="/check-circle.svg" alt="" />
          <span className="font-medium text-lg text-white">
            Você votou em: {selectedParticipantName}
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center w-full">
        {voteData?.participants?.map((participant) => (
          <button
            key={participant.participant.id}
            onClick={() => handleClickVote(participant.participant.id, participant.participant.name)}
            className={`flex items-center justify-between md:flex-col p-4 gap-2 md:gap-16 md:max-h-[356px] border rounded-lg w-full md:p-6
              ${selectedParticipantName === participant.participant.name 
                ? 'border-[#7C5AED] bg-[#7C5AED]/10' 
                : 'border-[#FFFFFF]/50 bg-[#FFFFFF]/10'
              } backdrop-blur-lg
              ${confirmedVote || isVoteClosed 
                ? selectedParticipantName === participant.participant.name 
                  ? '' 
                  : 'cursor-not-allowed opacity-10'
                : 'cursor-pointer'
              }
              transition-all duration-200
            `}
            disabled={confirmedVote || isVoteClosed}
          >
            <span className="font-medium text-2xl text-white">
              {participant.participant.name}
            </span>
            <img 
              src={participant.participant.imageUrl} 
              alt={participant.participant.name} 
              className="w-24 h-24 md:w-80 md:h-50 object-cover rounded"
            />
          </button>
        ))}
      </div>

      <button 
        onClick={handleConfirmedVote}
        className={`mt-4 px-6 py-2 md:w-1/2 cursor-pointer ${
          selectedParticipantName && !isVoting && !isVoteClosed
            ? 'bg-[#D818A5] text-[#FAFAFA] hover:bg-[#D818A5]/90' 
            : 'bg-[#BBBDBF] text-[#727579] cursor-not-allowed'
        } rounded-lg font-medium transition-all duration-200`}
        disabled={!selectedParticipantName || confirmedVote || isVoting || isVoteClosed}
      >
        {isVoteClosed ? 'Votação Encerrada' : isVoting ? 'Votando...' : 'Confirmar Voto'}
      </button>
    </section>
  )
}