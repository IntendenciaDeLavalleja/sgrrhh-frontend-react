import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '../layouts/Layout'
import { AsistenciasPage } from '../pages/AsistenciasPage'
import { ConfiguracionPage } from '../pages/ConfiguracionPage'
import { ContratosPage } from '../pages/ContratosPage'
import { DashboardPage } from '../pages/DashboardPage'
import { FuncionarioDetailPage } from '../pages/FuncionarioDetailPage'
import { FuncionariosPage } from '../pages/FuncionariosPage'
import { FuncionarioZafralDetailPage } from '../pages/FuncionarioZafralDetailPage'
import { FuncionariosZafralesPage } from '../pages/FuncionariosZafralesPage'
import { LoginPage } from '../pages/LoginPage'
import { ReportesPage } from '../pages/ReportesPage'
import { useAuthStore } from '../store/authStore'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore()
  return checkAuth() ? <>{children}</> : <Navigate to="/login" replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="funcionarios" element={<FuncionariosPage />} />
        <Route path="funcionarios/:id" element={<FuncionarioDetailPage />} />
        <Route path="funcionarios-zafrales" element={<FuncionariosZafralesPage />} />
        <Route path="funcionarios-zafrales/:id" element={<FuncionarioZafralDetailPage />} />
        <Route path="contratos" element={<ContratosPage />} />
        <Route path="asistencias" element={<AsistenciasPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

