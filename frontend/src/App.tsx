import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CircularProgress, Box } from '@mui/material';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import Layout from './components/Layout';
import EmpleadosPage from './pages/empleados/EmpleadosPage';
import DepartamentosPage from './pages/departamentos/DepartamentosPage';
import AcademicoPage from './pages/academico/AcademicoPage';
import ExpedientePage from './pages/expediente/ExpedientePage';
import NominaPage from './pages/nomina/NominaPage';
import ReportesPage from './pages/reportes/ReportesPage';

const queryClient = new QueryClient();

function RutaProtegida({ children, rolesPermitidos }: { children: React.ReactNode, rolesPermitidos?: string[] }) {
  const { token, cargando, usuario } = useAuth();

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!token) return <Navigate to="/login" />;

  if (rolesPermitidos && usuario && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route element={<RutaProtegida><Layout /></RutaProtegida>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/empleados" element={<EmpleadosPage />} />
        <Route path="/academico" element={
          <RutaProtegida rolesPermitidos={['ADMINISTRADOR', 'GESTOR_RRHH']}>
            <AcademicoPage />
          </RutaProtegida>
        } />
        <Route path="/expediente" element={
          <RutaProtegida rolesPermitidos={['ADMINISTRADOR', 'GESTOR_RRHH']}>
            <ExpedientePage />
          </RutaProtegida>
        } />
        <Route path="/nomina" element={
          <RutaProtegida rolesPermitidos={['ADMINISTRADOR', 'GESTOR_RRHH']}>
            <NominaPage />
          </RutaProtegida>
        } />
        <Route path="/reportes" element={
          <RutaProtegida rolesPermitidos={['ADMINISTRADOR', 'GESTOR_RRHH']}>
            <ReportesPage />
          </RutaProtegida>
        } />
        <Route path="/departamentos" element={
          <RutaProtegida rolesPermitidos={['ADMINISTRADOR']}>
            <DepartamentosPage />
          </RutaProtegida>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}