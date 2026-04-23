import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CircularProgress, Box } from '@mui/material';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';

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
      <Route path="/dashboard" element={<RutaProtegida><DashboardPage /></RutaProtegida>} />
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