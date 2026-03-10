import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Admin } from "./components/admin/admin";
import { Participants } from "./components/admin/participants";
import { Register } from "./components/register";
import { Login } from "./components/login";
import { UseAuth } from "./context/auth-context";
import { Votations } from "./components/admin/votations";
import { PainelVotation } from "./components/admin/painel-votation";
import { Vote } from "./components/vote/vote";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = UseAuth()


  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = UseAuth()

  // Se já está autenticado, redireciona para admin
  return isAuthenticated ? <Navigate to="/admin" replace /> : <>{children}</>
}

export function App() {
  return (
    <div className="w-full m-auto">
      <BrowserRouter>
        <Routes>
          {/* rota principal redireciona para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* rotas públicas -> redirecionam para admin se já logado */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          <Route path="/votacao/:id" element={
              <Vote />
          } />

          {/* Rotas protegidas */}
          <Route path="/admin" element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          } />
          
          <Route path="/participants" element={
            <PrivateRoute>
              <Participants />
            </PrivateRoute>
          } />

           <Route path="/votations" element={
            <PrivateRoute>
              <Votations />
            </PrivateRoute>
          } />

          <Route path="/painel-votation/:id" element={
            <PrivateRoute>
              <PainelVotation />
            </PrivateRoute>
          } />

        </Routes>
      </BrowserRouter>
    </div>
  )
}