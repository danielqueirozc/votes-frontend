import { useEffect } from "react";
import { Sidebar } from "../sidebar";
import { UseVote } from "@/context/vote-context";
import { DateFormatter } from "@/utils/date-formatter";

export function Votations() {
  const { votes, List, Delete } = UseVote()

  useEffect(() => {
    List()
  }, [List])
  
  console.log(votes)
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col p-10 overflow-auto">
        <div className="flex justify-between">
          <h1 className="font-bold text-xl">Minhas votações</h1>
          <button 
            className="cursor-pointer transition-all hover:text-[#7C5AED]"
            onClick={() => Delete()}
          >
            Excluir histórico
          </button>
        </div>
          <table 
            className="w-full mt-6 px-2"
          >
          <thead className="w-screen">
            <tr className="w-full flex justify-between">
              <th>Nome da votação</th>
              <th>Data de Realização</th>
              <th>Vencedor</th>
            </tr>
          </thead>
           { votes.map((vote, index) => (
             <tbody
              key={vote.id}
              className=""
            >
              <tr className={`text-[#5D7285] bg-[#CCBFF8] rounded-lg flex justify-between px-2 py-4 ${index > 0 ? 'mt-8' : ''}`}>
                <td className="font-medium truncate">{vote.title}</td>
                <td className="font-bold truncate">{vote.createdAt && DateFormatter(vote.createdAt)}</td>
                <td className="font-medium truncate">{vote.winnerName}</td>
              </tr>
            </tbody>
           )) }
          </table>
      </div>
    </div>
  )
}