import { useEffect, useState } from "react";
import {  useNavigate} from 'react-router-dom'
import { House, LogOut, NotebookPen } from "lucide-react";
import { UseAuth } from "@/context/auth-context";


export function Sidebar() {
  const [activeTab, setActiveTab] = useState<"home" | "votacoes" | "participantes">("home")
  const [ newVotationClicked, setNewVotationClicked] = useState(false)
  const { Logout } = UseAuth()
  // const { newVotationClicked } = UseVotation()

  const navigate = useNavigate()

  useEffect(() => {
    if (newVotationClicked) {
      setActiveTab("participantes")
    }
  }, [newVotationClicked])

  function HandleClickAdmin() {
    setActiveTab("home")
    navigate('/admin')
  }

  function HandleClickVotation() {
    setActiveTab("votacoes")
    navigate('/votations')
  }

  function HandleLogout() {
    Logout()
  }

  return (
    <article className="w-[297px] h-screen flex flex-col justify-between bg-[#FAFAFA] px-5 py-7">
      <div className="flex flex-col gap-12">
        <h1 className="text-[#222222]">TITULO</h1>
        <div className="flex flex-col gap-4">
          <button
            onClick={HandleClickAdmin}
            className={`cursor-pointer px-5 py-3 flex gap-2 rounded-lg ${activeTab === "home" ? "bg-[#7C5AED]/20" : ""}`}
          >
            <House className={`text-[#5D7285] ${activeTab === "home" ? "text-[#7C5AED]" : ""}`} />
            <p className={`text-[#5D7285] font-semibold ${activeTab === "home" ? "text-[#7C5AED]" : ""}`}>Home</p>
          </button>
  
          <button
            onClick={HandleClickVotation}
            className={`cursor-pointer px-5 py-3 flex gap-2 rounded-lg ${activeTab === "votacoes" ? "bg-[#7C5AED]/20" : ""}`}
          >
            <House className={`text-[#5D7285] ${activeTab === "votacoes" ? "text-[#7C5AED]" : ""}`} />
            <p className={`text-[#5D7285] font-semibold ${activeTab === "votacoes" ? "text-[#7C5AED]" : ""}`}>Votações</p>
          </button>

          {/* <button
            onClick={() => setActiveTab("votacoes")}
            className={`cursor-pointer px-5 py-3 flex gap-2 rounded-lg ${activeTab === "votacoes" ? "bg-[#7C5AED]/20" : ""}`}
          >
            <VoteIcon className={`text-[#5D7285] ${activeTab === "votacoes" ? "text-[#7C5AED]" : ""}`} />
            <p className={`text-[#5D7285] font-semibold ${activeTab === "votacoes" ? "text-[#7C5AED]" : ""}`}>Votações</p>
          </button> */}

          {newVotationClicked && (
            <button
              onClick={() => setActiveTab("participantes")}
              className={`px-5 py-3 flex gap-2 rounded-lg ${activeTab === "participantes" ? "bg-[#7C5AED]/20" : ""}`}
            >
              <NotebookPen className={`text-[#5D7285] ${activeTab === "participantes" ? "text-[#7C5AED]" : ""}`} />
              <p className={`text-[#5D7285] font-semibold ${activeTab === "participantes" ? "text-[#7C5AED]" : ""}`}>
                Participantes
              </p>
            </button>
          )}
        </div>
      </div>

      <button 
        className="bg-[#282A2F] px-5 py-3 flex justify-center items-center gap-2 rounded-lg cursor-pointer"
        onClick={HandleLogout}
        >
        <LogOut className="text-[#FAFAFA]"/>
        <p className="text-[#FAFAFA] font-semibold text-[22px]">Logout</p>
      </button>
    </article>
  )
}
