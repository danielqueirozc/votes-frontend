import { Search } from "lucide-react";
import { Sidebar } from "../sidebar";
import { ParticipantItem } from "./participant-item";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

import { DialogNewParticipant } from "./dialog";
import { useEffect, useState, type FormEvent } from "react"; // Importe FormEvent
import { useParticipants } from "@/context/use-participants";
import { useNavigate } from "react-router-dom";
import { UseVote } from "@/context/vote-context";

interface Participant {
    id: string
    name: string
    imageUrl: string
}

export function Participants() {
    const navigate = useNavigate()
    const { Create } = UseVote()

    // É uma boa prática tipar o estado para ter autocomplete e segurança
    const { participants, ListParticipants }: { participants: Participant[], ListParticipants: () => void } = useParticipants()
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
    const [isCreatingVote, setIsCreatingVote] = useState(false)
    const [voteTitle, setVoteTitle] = useState('')

    useEffect(() => {
        ListParticipants()
    }, [ListParticipants])

    async function handleCreateVote(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsCreatingVote(true)

        console.log('Criando votação...')

        if (selectedParticipants.length < 2 || selectedParticipants.length > 3) {
            alert('Você precisa selecionar entre 2 e 3 participantes para criar uma votação')
            setIsCreatingVote(false)
            return
        }

        if (!voteTitle.trim()) {
            alert('Por favor, digite um título para a votação')
            setIsCreatingVote(false)
            return
        }

        try {
            const { newVote } = await Create({ title: voteTitle, participantIds: selectedParticipants })
            
            console.log('Votação criada com sucesso!')
            alert('Votação criada com sucesso!')

            navigate(`/painel-votation/${newVote.id}`)
            
            // Limpa o estado após o sucesso
            setSelectedParticipants([])
            setVoteTitle('')
            
        } catch (error) {
            console.error("Erro detalhado ao criar votação:", error)
            alert('Erro ao criar votação. Verifique o console para mais detalhes.')
        } finally {
            setIsCreatingVote(false)
        }
    }   

    function handleParticipantSelection(participantId: string) {
        setSelectedParticipants(prev => {

            // se o participante ja estiver na lista, remove ele quando clicar
            if (prev.includes(participantId)) {
                return prev.filter(id => id !== participantId)
            }

            // se o participante nao estiver na lista, adiciona ele
            if (prev.length < 3) {
                return [...prev, participantId]
            }
            alert('Você pode selecionar no máximo 3 participantes')
            return prev
        })
    }

    return (
        <div className="flex h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col px-5">
                <header className="mt-[72px]">
                    <h1 className="text-5xl text-[#111213] font-bold">Participantes</h1>
                </header>
                
                <div className="mt-10 flex justify-between">
                    <div className="relative flex items-center">
                        <input 
                            className="bg-[#CCBFF8]/20 w-full max-w-[464px] h-[62px] rounded-lg placeholder:text-[#333333] px-5 py-6"
                            type="text" 
                            placeholder="Procure alguem..." 
                        />
                        <button type="button" className="absolute right-6 w-9 h-9 rounded-full flex items-center justify-center bg-[#7C5AED] text-[#FAFAFA] cursor-pointer">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <button type="button" className="bg-[#D818A5] px-12 py-5 text-[#FAFAFA] font-medium rounded-lg cursor-pointer">
                                Cadastrar participante
                            </button>
                        </DialogTrigger>
                        <DialogContent className="p-0">
                            <DialogNewParticipant />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="w-full p-5">
                    <div className="flex flex-col gap-2">
                        <h3 className="font-medium text-2xl text-[#212121]">Participantes cadastrados</h3>
                        <span className="font-medium text-[#B5B5C3] uppercase">
                            {participants.length} participantes | {selectedParticipants.length} selecionados
                        </span>
                    </div>

                    <section className="mt-10 flex flex-col flex-1">
                        <div className="flex justify-between items-center p-5 bg-[#F3F6F9] rounded-lg">
                            <h2 className="font-semibold uppercase text-[#464E5F]">Participante</h2>
                            <h2 className="font-semibold uppercase text-[#B5B5C3]">Seleção</h2>
                        </div>

                       <div className="flex-1 overflow-y-auto max-h-[500px]">
                         {participants.map((participant) => (
                            <div 
                                key={participant.id}
                                className={`flex justify-between items-center p-5 border-b ${
                                    selectedParticipants.includes(participant.id) 
                                        ? 'bg-[#7C5AED]/10 border-[#7C5AED]' 
                                        : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                <ParticipantItem participant={participant} />
                                
                                <button
                                    onClick={() => handleParticipantSelection(participant.id)}
                                    className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                                        selectedParticipants.includes(participant.id)
                                            ? 'bg-[#7C5AED] text-white'
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    {selectedParticipants.includes(participant.id) ? 'Selecionado' : 'Selecionar'}
                                </button>
                            </div>
                        ))}
                       </div>
                    </section>
                </div>

                {/* Apenas mostra o botão para abrir o modal se houver participantes selecionados */}
                {selectedParticipants.length >= 2 && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <button 
                                type="button"
                                className="bg-[#D818A5] px-12 py-5 text-[#FAFAFA] font-medium rounded-lg cursor-pointer h-16 mt-auto self-end mb-7"
                            >
                                Criar votação ({selectedParticipants.length} participantes)
                            </button>
                        </DialogTrigger>
                        <DialogContent className="p-0">
                            {/* O formulário agora está AQUI, envolvendo o conteúdo do modal */}
                            <form onSubmit={handleCreateVote} className="flex flex-col justify-between w-lg px-8 py-6 h-68 gap-4">
                                <DialogTitle>
                                    Escolha um título para a sua votação
                                </DialogTitle>
                                <input
                                    className="bg-[#CCBFF8]/20 w-full h-[62px] rounded-lg placeholder:text-[#333333] px-5 py-6"
                                    placeholder="Escreva algum titulo..."
                                    name="title"  
                                    type="text"
                                    value={voteTitle}
                                    onChange={(e) => setVoteTitle(e.target.value)}
                                    required
                                />
                                <div className="flex justify-end gap-2">
                                    {/* Botão para fechar o modal sem submeter */}
                                    <DialogClose asChild>
                                        <button type="button" className="bg-gray-200 px-8 py-4 text-gray-800 font-medium rounded-lg">
                                            Cancelar
                                        </button>
                                    </DialogClose>
                                    <button
                                        type="submit" 
                                        disabled={isCreatingVote}
                                        className="bg-[#7C5AED] px-8 py-4 text-[#FAFAFA] font-medium rounded-lg cursor-pointer disabled:opacity-50"
                                    >
                                        {isCreatingVote ? 'Criando...' : 'Confirmar Votação'}
                                    </button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}