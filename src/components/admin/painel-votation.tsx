import { useState, useEffect, useMemo } from "react"
import { Copy, Check, X } from "lucide-react"
import { UseVote } from "@/context/vote-context"
import { useParams } from "react-router-dom"
import { useWebSocket } from "@/context/websocket-context"

interface Participant {
  id: string
  name: string
  imageUrl: string
  votes: number
}

export function PainelVotation() {
  const { id } = useParams()
  const [currentVoteLink, setCurrentVoteLink] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isVoteClosed, setIsVoteClosed] = useState(false) // estado de encerramento
  const [isClosing, setIsClosing] = useState(false)
  
  const { ListById, voteData, lastCreatedVoteLink, CloseVote } = UseVote() // importa CloseVote
  const { isConnected, lastMessage } = useWebSocket()
 
  useEffect(() => {
    if (id) {
      ListById(id)
    }
  }, [id])

  useEffect(() => {
    if (lastCreatedVoteLink) {
      setCurrentVoteLink(lastCreatedVoteLink)
    }

    const savedLink = localStorage.getItem('currentVoteLink')
    if (savedLink) {
      setCurrentVoteLink(savedLink)
    }
  }, [lastCreatedVoteLink])

  // ✅ Inicializar participantes e verificar status
  useEffect(() => {
    if (voteData?.participants) {
      console.log("dados iniciais da votação:", voteData)
      
      const initial = voteData.participants.map(p => ({
        id: p.participant.id,
        name: p.participant.name,
        imageUrl: p.participant.imageUrl,
        votes: 0
      }))

      setParticipants(initial)
      
      // verifica se a votação já está encerrada
      if (voteData.status === 'CLOSED') {
        setIsVoteClosed(true)
      }
    }
  }, [voteData])

  // ✅ PROCESSAR MENSAGENS DO WEBSOCKET
  useEffect(() => {
    if (!lastMessage) return
    
    // processa vote_update
    if (lastMessage.event === 'vote_update') {
      const data = lastMessage.data
      
      if (data.voteId !== id) {
        return
      }

      if (!Array.isArray(data.participants)) {
        return
      }

      const updatedParticipants = data.participants.map((p: any) => ({
        id: p.participant.id,
        name: p.participant.name,
        imageUrl: p.participant.imageUrl,
        votes: p.votes
      }))
      
      setParticipants(updatedParticipants)
    }
    
    // processa vote_closed
    if (lastMessage.event === 'vote_closed') {
      const data = lastMessage.data
      
      if (data.voteId === id) {
        setIsVoteClosed(true)
      }
    }
  }, [lastMessage, id])

  const totalVotes = useMemo(() => {
    const total = participants.reduce((sum, p) => sum + p.votes, 0)
    return total
  }, [participants])
  
  async function HandleCopyLink() {
    if (!currentVoteLink) {
      alert('Nenhum link disponível para copiar')
      return
    }

    try {
      await navigator.clipboard.writeText(currentVoteLink)
      setCopied(true)
      setShowToast(true)
      
      setTimeout(() => setCopied(false), 2000)
      setTimeout(() => setShowToast(false), 3000)
    } catch (error) {
      console.error('Erro ao copiar link:', error)
    }
  }

  // ✅ Função para encerrar votação (agora usando o contexto)
  async function handleCloseVote() {
    if (!id) return
    if (isVoteClosed) return
    
    const confirmClose = window.confirm(
      "Tem certeza que deseja encerrar a votação? Esta ação não pode ser desfeita."
    )
    
    if (!confirmClose) return
    
    setIsClosing(true)
    
    try {
      // usa a função do contexto
      await CloseVote(id)
      
      setIsVoteClosed(true)
      setShowToast(true)
      
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert("Apenas o criador pode encerrar a votação")
      } else if (error.response?.status === 400) {
        alert("Votação já está encerrada")
        setIsVoteClosed(true)
      } else {
        alert("Erro ao encerrar votação. Tente novamente.")
      }
    } finally {
      setIsClosing(false)
    }
  }

  function CloseToast() {
    setShowToast(false)
  }
  
  return (
    <div className="flex flex-col justify-center items-center w-full h-screen gap-7 relative">
      {/* Toast Notification */}
      {showToast && isVoteClosed && (
        <div className="fixed top-5 right-5 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-right">
          <X className="w-5 h-5" />
          <span className="font-medium">Votação Encerrada!</span>
          <button 
            onClick={CloseToast}
            className="hover:bg-red-600 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showToast && !isVoteClosed && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-right">
          <Check className="w-5 h-5" />
          <span className="font-medium">Link copiado com sucesso!</span>
          <button 
            onClick={CloseToast}
            className="hover:bg-green-600 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quadro de status */}
      <div className="fixed top-5 left-5 bg-black/80 text-white p-4 rounded-lg text-xs max-w-md">
        <div>🔌 WebSocket: {isConnected ? '✅ Conectado' : '❌ Desconectado'}</div>
        <div>🎯 Vote ID: {id}</div>
        <div>👥 Participantes: {participants.length}</div>
        <div>📊 Total Votos: {totalVotes}</div>
        <div>🔒 Status: {isVoteClosed ? '❌ Encerrada' : '✅ Ativa'}</div>
      </div>

      {/* Banner de votação encerrada */}
      {isVoteClosed && (
        <div className="w-full bg-red-500 text-white py-4 px-6 text-center font-bold text-lg">
          🔒 VOTAÇÃO ENCERRADA - Não é mais possível votar
        </div>
      )}

      <div className="flex p-6 gap-4">
        {participants.length === 0 ? (
          <div className="text-gray-500">Carregando participantes...</div>
        ) : (
          participants.map((participant) => {
            const percent = totalVotes > 0 
              ? ((participant.votes / totalVotes) * 100).toFixed(1) 
              : '0.0'

            return (
              <div 
                key={participant.id} 
                className={`flex flex-col justify-between py-16 px-8 max-w-60 h-[388px] border-2 rounded-lg transition-all duration-300 ${
                  isVoteClosed ? 'bg-gray-100 opacity-75' : 'bg-[#000000]/5'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium text-lg">{participant.name}</span>
                  <strong className="text-2xl mt-2">{percent}%</strong>
                  <span className="text-sm text-gray-600 mt-1">
                    {participant.votes} {participant.votes === 1 ? 'voto' : 'votos'}
                  </span>
                </div>
                <img 
                  src={participant.imageUrl} 
                  alt={participant.name}
                  className="w-full h-auto object-contain"
                />
              </div>
            )
          })
        )}
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={handleCloseVote}
          disabled={isVoteClosed || isClosing}
          className={`w-[230px] h-16 px-12 py-5 border-2 rounded-lg font-semibold transition-colors ${
            isVoteClosed 
              ? 'border-gray-400 text-gray-400 cursor-not-allowed'
              : 'border-[#545759] text-[#545759] hover:bg-[#545759] hover:text-white cursor-pointer'
          }`}
        >
          {isClosing ? 'Encerrando...' : isVoteClosed ? 'Votação Encerrada' : 'Encerrar votação'}
        </button>
        
        <div className="flex items-center border-2 rounded-lg bg-[#EFF0F0] text-[#545759] h-16 px-4 gap-3 max-w-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">
              {currentVoteLink || "Link da votação aparecerá aqui"}
            </p>
          </div>
          
          {currentVoteLink && (
            <button
              onClick={HandleCopyLink}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer ${
                copied 
                  ? 'bg-green-500 text-white scale-110' 
                  : 'bg-[#7C5AED] text-white hover:bg-[#7C5AED]/80 hover:scale-105'
              }`}
              title={copied ? 'Link copiado!' : 'Copiar link'}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}