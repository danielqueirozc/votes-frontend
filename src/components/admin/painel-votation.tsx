import { useState, useEffect, use } from "react"
import { Copy, Check, X } from "lucide-react"
import { UseVote } from "@/context/vote-context"
import { ParticipantService, VoteService } from "@/lib/axios"
import { useParams } from "react-router-dom"

interface Participant {
  id: string
  name: string
  imageUrl: string
  votes: number
}


export function PainelVotation() {
  const { id } = useParams()
  const { lastCreatedVoteLink } = UseVote()
  const [currentVoteLink, setCurrentVoteLink] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const { ListById, voteData } = UseVote()

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000/ws")

    ws.onopen = () => console.log("🔌 Conectado ao WebSocket")

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)

      if (message.type === "VOTE_UPDATED") {
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === message.data.participantId
              ? { ...p, votes: message.data.newCount }
              : p
          )
        )
      }
    }

    ws.onclose = () => console.log("❌ Desconectado do WebSocket")

    return () => ws.close()
  }, [])

  useEffect(() => {
    console.log("id recebido via params",id)
    if (id) {
      ListById(id)
    }
  }, [id])

  useEffect(() => {
    console.log("voteData recebido via context",voteData)
  }, [voteData])

  useEffect(() => {
    if (lastCreatedVoteLink) {
      setCurrentVoteLink(lastCreatedVoteLink)
    }
    
    const savedLink = localStorage.getItem('currentVoteLink')
    if (savedLink) {
      setCurrentVoteLink(savedLink)
    }
  }, [lastCreatedVoteLink])

  async function HandleCopyLink() {
    if (!currentVoteLink) {
      alert('Nenhum link disponível para copiar')
      return
    }

    try {
      await navigator.clipboard.writeText(currentVoteLink)
      setCopied(true)
      setShowToast(true)
      
      setTimeout(() => {
        setCopied(false)
      }, 2000)

      setTimeout(() => {
        setShowToast(false)
      }, 3000)
    } catch (error) {
      console.error('Erro ao copiar link:', error)
    }
  }

  function CloseToast() {
    setShowToast(false)
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen gap-7 relative">
      {/* Toast Notification */}
      {showToast && (
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

      

      <div className="flex p-6 gap-4">

      { voteData?.participants?.map((p) => {
        console.log(p)
         return (
          <button key={p.participant.id} className="flex flex-col justify-between py-16 px-8 max-w-60 h-[388px] border-2 rounded-lg bg-[#000000]/5 cursor-pointer">
            <div className="flex flex-col items-center">
              <span className="font-medium text-lg">{p.participant.name}</span>
              <strong>49,8%</strong>
            </div>
            <img src={p.participant.imageUrl} alt="" />
        </button>
         )
      }) }

        
        
        {/* <button className="flex flex-col justify-between py-16 px-8 max-w-60 h-[388px] border-2 rounded-lg bg-[#000000]/5 cursor-pointer">
          <div className="flex flex-col items-center">
            <span className="font-medium text-lg">JavaScript</span>
            <strong>49,8%</strong>
          </div>
          <img src="/js.png" alt="" />
        </button>
        
        <button className="flex flex-col justify-between py-16 px-8 max-w-60 h-[388px] border-2 rounded-lg bg-[#000000]/5 cursor-pointer">
          <div className="flex flex-col items-center">
            <span className="font-medium text-lg">JavaScript</span>
            <strong>49,8%</strong>
          </div>
          <img src="/js.png" alt="" />
        </button> */}
      </div>
      
      <div className="flex gap-4">
        <button className="w-[230px] h-16 px-12 py-5 border-2 border-[#545759] rounded-lg cursor-pointer font-semibold text-[#545759]">
          Encerrar votação
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


