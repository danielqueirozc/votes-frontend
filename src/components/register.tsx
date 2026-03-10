import { AuthService } from "@/lib/axios"
import axios from "axios"
import { useState } from "react"
import {  useNavigate } from "react-router-dom"

export function Register() {
const [error, setError] = useState('')
const navigate = useNavigate()

async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault()

  const formData = new FormData(event.currentTarget)

  const name = formData.get('name')
  const email = formData.get('email')
  const password = formData.get('password')

  try {
    await AuthService.register({
      name: name as string,
      email: email as string,
      password: password as string,
    })

    
  } catch (err) {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.error || 'Erro ao registrar usuário')
    }
  }
}

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-[400px] h-[500px] bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-10 shadow-2xl shadow-black/10 text-center text-black">
          <h1>Registre-se</h1>

       <div className="flex flex-col gap-3 mt-10">
         <div className="flex flex-col gap-2">
          <label className="text-left font-medium text-gray-600">Nome</label>
          <input 
            className="w-full h-10 rounded-lg border border-gray-400 p-3"
            type="text"
            name="name"
            placeholder="Digite seu nome"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-left font-medium text-gray-600">E-mail</label>
          <input 
            className="w-full h-10 rounded-lg border border-gray-400 p-3"
            type="text" 
            name="email"
            placeholder="Digite seu E-mail"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-left font-medium text-gray-600">Senha</label>
          <input 
            className="w-full h-10 rounded-lg border border-gray-400 p-3"
            type="password" 
            name="password"
            placeholder="Digite sua Senha"
          />
        </div>
       </div>

       {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        type="submit"
        className="w-full h-10 mt-10 rounded-lg bg-[#0078D5] text-white cursor-pointer font-medium"
      >
        Registrar
      </button>

      <div className="mt-1">
        <button
        onClick={() => navigate('/login')}
        className="mt-8 hover:underline text-gray-400 cursor-pointer"
      >
        Já tenho uma conta
      </button>
      </div>
      </form>
    </div>
  )
}