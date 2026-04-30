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

const queryClient = new QueryClient();

function RutaProtegida({ children }: { children: React.ReactNode }) {
  const { token, cargando } = useAuth();

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return token ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route element={<RutaProtegida><Layout /></RutaProtegida>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/empleados" element={<EmpleadosPage />} />
        <Route path="/academico" element={<AcademicoPage />} />
        <Route path="/expediente" element={<Box sx={{ p: 2 }}>Página de Expediente - Próximamente</Box>} />
        <Route path="/nomina" element={<Box sx={{ p: 2 }}>Página de Nómina - Próximamente</Box>} />
        <Route path="/reportes" element={<Box sx={{ p: 2 }}>Página de Reportes - Próximamente</Box>} />
        <Route path="/departamentos" element={<DepartamentosPage />} />
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