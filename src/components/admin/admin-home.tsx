// import { House, LogOut, Vote } from "lucide-react";
import { Link } from "react-router-dom";
import { Sidebar } from "../sidebar";
import { useNavigate } from "react-router-dom";

export function AdminHome() {
    const navigate  = useNavigate()

    function handleClick ()  {
        navigate('/participants')
    }

    return (
        <div className="flex h-screen bg[#FEFCFB]">
           <Sidebar />

           <div className="flex-1 relative h-screen overflow-auto">
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex flex-col gap-10 w-[340px] text-center">
                        <img 
                            src="/eye.png"
                            className="w-[200px] h-[200px] mx-auto"
                            alt="Olho ilustrativo" 
                        />

                        <strong className="text-[#727579] text-[22px]">
                            Nenhuma votação cadastrada
                        </strong>

                        <button onClick={handleClick } className="bg-[#D818A5] text-[#FAFAFA] w-full h-16 px-12 py-5 rounded-lg cursor-pointer">    
                            <Link to="/participants">Criar nova votação</Link> 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}