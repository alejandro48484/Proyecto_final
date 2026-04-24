import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Paper, Alert, CircularProgress
} from '@mui/material';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await login(correo, contrasena);
      navigate('/dashboard');
    } catch {
      setError('Credenciales incorrectas. Intente de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2e5090 100%)',
    }}>
      <Paper elevation={6} sx={{ p: 5, maxWidth: 420, width: '100%', borderRadius: 3 }}>
        <Typography variant="h4" align="center" sx={{ fontWeight: 'bold' }} color="primary" gutterBottom>
          Sistema RRHH
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Gestión de Recursos Humanos y Nómina
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            required
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={cargando}
            sx={{ py: 1.5 }}
          >
            {cargando ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}