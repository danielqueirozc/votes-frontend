import { useLocation, useNavigate } from 'react-router-dom';
import { House, LogOut, Vote } from "lucide-react";
import { UseAuth } from "@/context/auth-context";


export function Sidebar() {
  const location = useLocation()
  
  const { Logout } = UseAuth()

  const navigate = useNavigate()

  function HandleClickAdmin() {
    navigate('/admin')
  }

  function HandleClickVotation() {
    navigate('/votations')
  }

  function HandleLogout() {
    Logout()
  }

  const isHomeActive = location.pathname.startsWith('/admin') || location.pathname === '/' || location.pathname.startsWith('/participants') // fica true se estiver na rota /admin ou /
  const isVotationsActive = location.pathname.startsWith('/votations')

  return (
    <article className="w-[297px] h-screen flex flex-col justify-between bg-[#FAFAFA] px-5 py-7">
      <div className="flex flex-col gap-12">
        <div className="flex gap-2 items-center">
          <h1 className="text-[#5D7285] font-extrabold text-2xl">VOTES</h1>
          <img
            className='h-6'
            src="/logo.svg" 
            alt="Logo" 
          />
        </div>
        <div className="flex flex-col gap-4">
          <button
            onClick={HandleClickAdmin}
            className={`cursor-pointer px-5 py-3 flex gap-2 rounded-lg ${isHomeActive ? "bg-[#7C5AED]/20" : ""}`}
          >
            <House className={`text-[#5D7285] ${isHomeActive ? "text-[#7C5AED]" : ""}`} />
            <p className={`text-[#5D7285] font-semibold ${isHomeActive ? "text-[#7C5AED]" : ""}`}>Home</p>
          </button>
  
          <button
            onClick={HandleClickVotation}
            className={`cursor-pointer px-5 py-3 flex gap-2 rounded-lg ${isVotationsActive ? "bg-[#7C5AED]/20" : ""}`}
          >
            <Vote className={`text-[#5D7285] ${isVotationsActive ? "text-[#7C5AED]" : ""}`} />
            <p className={`text-[#5D7285] font-semibold ${isVotationsActive ? "text-[#7C5AED]" : ""}`}>Votações</p>
          </button>

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
