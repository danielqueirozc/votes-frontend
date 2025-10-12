import { UseAuth } from "@/context/auth-context"
import { AuthService } from "@/lib/axios"
import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export function Login() {
  const [error, setError] = useState('')
  const { Login, token } = UseAuth()
  const navigate = useNavigate()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const email = formData.get('email')
    const password = formData.get('password')

    // Validação básica
    if (!email || !password) {
      setError('Email e senha são obrigatórios')
      return
    }

    try {
      setError('') // Limpa erros anteriores
      
      const response = await AuthService.login({
        email: email as string,
        password: password as string
      })

      console.log("Token recebido do backend:", response.token)

      // Chama o Login do contexto
      Login(response.token)
      
      // Força o redirecionamento imediatamente após o login
      navigate('/admin', { replace: true })
      
    } catch (err) {
      console.error("Erro no login:", err)
      
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Erro ao fazer login')
      } else {
        setError('Erro inesperado ao fazer login')
      }
    }
  }

  // Verifica se já está logado ao montar o componente
  useEffect(() => {
    if (token) {
      navigate('/admin', { replace: true })
      console.log("Usuário já autenticado, redirecionando...")
    }
  }, [token, navigate])

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-[400px] h-[400px] bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-10 shadow-2xl shadow-black/10 text-center text-black">
        <h1>Login</h1>

        {/* Exibe erros se houver */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-10">
          <div className="flex flex-col gap-2">
            <label className="text-left font-medium text-gray-600">E-mail</label>
            <input 
              className="w-full h-10 rounded-lg border border-gray-400 p-3"
              type="email" 
              name="email"
              placeholder="Digite seu E-mail"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-left font-medium text-gray-600">Senha</label>
            <input 
              className="w-full h-10 rounded-lg border border-gray-400 p-3"
              type="password" 
              name="password"
              placeholder="Digite sua Senha"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-10 mt-10 rounded-lg bg-[#D818A5] text-white cursor-pointer font-medium hover:bg-[#C01694] transition-colors"
        >
          Login
        </button>

        <div className="mt-5">
          <button 
            type="button"
            onClick={() => navigate('/register')}
            className="hover:underline text-gray-400 cursor-pointer"
          >
            ainda não possui uma conta?
          </button>
        </div>
      </form>
    </div>
  )
}