import { FileUpload } from "./file-upload";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParticipants } from "@/context/use-participants";

const newVoteFormSchema = z.object({
    name: z.string(),    
    imageUrl: z.string(),
})

type NewVoteFormInputs = z.infer<typeof newVoteFormSchema>

export function DialogNewParticipant() {
    const { CreateParticipant } = useParticipants()

    const { register, handleSubmit, reset, setValue } = useForm<NewVoteFormInputs>({
        resolver: zodResolver(newVoteFormSchema),
    })

    async function handleCreateNewParticipant(data: NewVoteFormInputs) {
        const { name, imageUrl } = data

        try {
            console.log("📦 Dados enviados para CreateParticipant:", data)
            await CreateParticipant({ name, imageUrl })
        } catch( error ) {
            console.log('Error creating new transaction', error)
        } finally {
            reset()
        }
    } 

    return (
        <form
         onSubmit={ handleSubmit(handleCreateNewParticipant) }
         className="flex flex-col"
        >
            <header className="px-8 py-6 text-left font-semibold text-2xl">
                Novo participante
            </header>

            
            <div className="flex flex-col px-8 py-6">
                <FileUpload onFileUploaded={(url) => {
                    console.log("✅ URL pública recebida do backend:", url)
                    setValue("imageUrl", url)
                }} />

                <div className="flex flex-col py-6">
                    <label className="text-xl text-[#333333]">Nome</label>
                    <input 
                        className="w-full max-w-[464px] h-[62px] rounded-lg placeholder:text-[#D8DAE5] placeholder:text-xl px-5 py-6 border border-[#D8DAE5]"
                        type="text"
                        placeholder="Digite o nome"
                        { ...register('name') }
                     />
                    </div>
            </div>

            <div className="flex justify-between items-center border-t border-[#D8DAE5] w-full px-8 py-6">
                <button className="w-[167px] h-16 rounded-lg px-12 py-5 border border-[#545759] text-[#545759] font-medium cursor-pointer">
                    Cancelar
                </button>

                 <button type="submit" className="w-[167px] h-16 rounded-lg px-12 py-5 border bg-[#D818A5] text-[#FAFAFA] font-medium cursor-pointer">
                    Confirmar
                </button>
            </div>
        </form>
    )
}