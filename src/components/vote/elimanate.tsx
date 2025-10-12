import { VoteService } from "@/lib/axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

export function Eliminate() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [confirmedVote, setConfirmedVote] = useState<boolean>(false)
  const [voteData, setVoteData] = useState<VoteType | null>(null)
  const [wsConnected, setWsConnected] = useState<boolean>(false)
  const { id } = useParams()

  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connectWebSocket = () => {
      try {
        // ✅ Mudou para porta 4000
        ws = new WebSocket("ws://localhost:4000/ws")

        ws.onopen = () => {
          console.log("✅ Conectado ao WebSocket")
          setWsConnected(true)
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            console.log("📩 Mensagem recebida:", message)

            if (message.event === "new_vote") {
              console.log("🗳️ Nova votação criada:", message.data)
              if (message.data.id === id) {
                setVoteData(message.data)
              }
            }
          } catch (error) {
            console.error("❌ Erro ao processar mensagem:", error)
          }
        }

        ws.onclose = () => {
          console.log("❌ WebSocket desconectado, tentando reconectar...")
          setWsConnected(false)
          reconnectTimeout = setTimeout(connectWebSocket, 3000)
        }

        ws.onerror = (err) => {
          console.error("⚠️ Erro no WebSocket:", err)
          setWsConnected(false)
        }
      } catch (error) {
        console.error("❌ Erro ao criar WebSocket:", error)
        reconnectTimeout = setTimeout(connectWebSocket, 3000)
      }
    }

    connectWebSocket()

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (ws) ws.close()
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    VoteService.listById(id).then((response) => {
      setVoteData(response.data.vote)
      console.log(response.data.vote)
    })
  }, [id])

  function handleClickVote(itemName: string) {
    setSelectedItem(itemName)
  }

  function handleConfirmedVote() {
    if (selectedItem) {
      setConfirmedVote(true)
    }
  }

  return (
    <section className="flex flex-col items-center gap-4 mt-6">
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-white/70">
          {wsConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      {confirmedVote && (
        <div className="flex justify-start gap-1 w-full">
          <img src="/check-circle.svg" alt="" />
          <span className="font-medium text-lg text-white">
            Você votou em: {selectedItem}
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center w-full">
        {voteData?.participants?.map((participant) => (
          <button
            key={participant.participant.id}
            onClick={() => handleClickVote(participant.participant.name)}
            className={`flex items-center justify-between md:flex-col p-4 gap-2 md:gap-16 md:max-h-[356px] border rounded-lg w-full md:p-6
              ${selectedItem === participant.participant.name 
                ? 'border-[#7C5AED] bg-[#7C5AED]/10' 
                : 'border-[#FFFFFF]/50 bg-[#FFFFFF]/10'
              } backdrop-blur-lg
              ${confirmedVote && selectedItem != participant.participant.name 
                ? 'cursor-not-allowed opacity-10' 
                : 'cursor-pointer'
              }
            `}
          >
            <span className="font-medium text-2xl text-white">
              {participant.participant.name}
            </span>
            <img 
              src={participant.participant.imageUrl} 
              alt={participant.participant.name} 
              className="w-24 h-24 md:w-80 md:h-50"
            />
          </button>
        ))}
      </div>

      <button 
        onClick={handleConfirmedVote}
        className={`mt-4 px-6 py-2 md:w-1/2 cursor-pointer ${
          selectedItem ? 'bg-[#D818A5] text-[#FAFAFA]' : 'bg-[#BBBDBF] text-[#727579]'
        } rounded-lg font-medium`}
        disabled={!selectedItem || confirmedVote}
      >
        Confirmar Voto
      </button>
    </section>
  )
}