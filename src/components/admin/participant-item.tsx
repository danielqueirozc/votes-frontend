import { useParticipants } from "@/context/use-participants";
import { SquarePen, Trash2 } from "lucide-react";

interface ParticipantItemType {
 participant: {
    id: string,
    name: string,
    imageUrl: string
 }
}

export function ParticipantItem({ participant }: ParticipantItemType) {
    const { DeleteParticipant } = useParticipants()

    return (
        <div className="flex justify-between items-center gap-8 p-5">
            <div className="flex items-center gap-8">
                <img 
                    className="w-16 h-16"
                    src={ participant.imageUrl }
                    alt="" 
                />
                <span className="font-semibold text-[#464E5F] text-lg">{ participant.name }</span>
            </div> 

            <div className="flex gap-4">
                <button className="flex items-center justify-center bg-[#0078D5] p-[10px] text-[#FAFAFA] rounded-lg cursor-pointer">
                    <SquarePen />
                </button>
                
                <button
                    onClick={() => DeleteParticipant(participant.id)} 
                    className="flex items-center justify-center bg-[#E61B14] p-[10px] text-[#FAFAFA] rounded-lg cursor-pointer"
                >
                    <Trash2 />
                </button>
            </div>
            
        </div>
    )
}
