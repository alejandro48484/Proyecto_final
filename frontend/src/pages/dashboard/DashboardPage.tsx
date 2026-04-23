import { useAuth } from '../../context/AuthContext';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';

export default function DashboardPage() {
  const { usuario, logout } = useAuth();

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Panel Principal
          </Typography>
          <Button variant="outlined" color="error" onClick={logout}>
            Cerrar Sesión
          </Button>
        </Box>

        <Typography variant="h6" color="text.secondary">
          Bienvenido al Sistema de Gestión de RRHH y Nómina
        </Typography>

        {usuario && (
          <Box sx={{ mt: 3 }}>
            <Typography>Correo: {usuario.correo}</Typography>
            <Chip label={usuario.rol} color="primary" sx={{ mt: 1 }} />
          </Box>
        )}
      </Paper>
    </Box>
  );
}