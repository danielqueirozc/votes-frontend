import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface User {
  id: string
  username: string
}

interface AuthContextType {
  user: User | null
  Login: (newToken: string) => void
  Logout: () => void
  token: string | null
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    // verifica se estamos no browser antes de acessar localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  })

  useEffect(() => {
    if (token) {
      try {
        const parts = token.split('.')
        if (parts.length !== 3) {
          throw new Error("Token inválido - formato incorreto")
        }

        const payload = JSON.parse(atob(parts[1]))
        const expirationTime = payload.exp * 1000
        const currentTime = Date.now()

        if (expirationTime > currentTime) {
          setUser({ 
            id: payload.id || payload.sub, 
            username: payload.username || payload.name || 'Usuário' 
          })
          
        } else {
          // token expirado → limpa
          if (typeof window !== 'undefined') {
            localStorage.removeItem("token")
          }
          setToken(null)
          setUser(null)
        }
      } catch (err) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem("token")
        }
        setToken(null)
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [token])

  function Login(newToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken)
    }
    setToken(newToken)
  }

  function Logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ Login, Logout, user, token, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function UseAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('UseAuth must be used within a AuthContextProvider')
  }

  return context
}