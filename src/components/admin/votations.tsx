import { useEffect } from "react";
import { Sidebar } from "../sidebar";
import { UseVote } from "@/context/vote-context";
import { DateFormatter } from "@/utils/date-formatter";

export function Votations() {
  const { votes, List, Delete } = UseVote()

  useEffect(() => {
    List()
  }, [List])

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col p-10 overflow-auto">
        <div className="flex justify-between">
          <h1>Minhas votacoes</h1>
          <button 
            className="cursor-pointer transition-all hover:text-[#7C5AED]"
            onClick={() => Delete()}
          >
            Excluir histórico
          </button>
        </div>
        { votes.map(vote => (
          <table 
            key={vote.id}
            className="w-full border-separate border-transparent border-spacing-y-2 mt-6 px-2 bg-[#FAFAFA]"
          >
            <tbody>
                <tr>
                    <td>{vote.title}</td>
                    <td>{vote.createdAt && DateFormatter(vote.createdAt)}</td>
                    <td>Quem ganhou</td>
                </tr>
            </tbody>
          </table>
        )) }
      </div>
    </div>
  )
}