import { useState, useEffect } from 'react';
import cliente from '../../api/cliente';
import {
  Box, Typography, Card, CardContent, CircularProgress,
  Alert, Grid
} from '@mui/material';
import {
  People, Business, FolderOpen, AttachMoney,
  CheckCircle, Warning, Error as ErrorIcon
} from '@mui/icons-material';

export default function DashboardPage() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalEmpleados: 0,
    empleadosActivos: 0,
    empleadosSuspendidos: 0,
    empleadosRetirados: 0,
    totalDepartamentos: 0,
    periodosAbiertos: 0,
    periodosCerrados: 0,
    expedientesCompletos: 0,
    expedientesEnProceso: 0,
    expedientesIncompletos: 0,
  });

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setCargando(true);
        const [empRes, depRes, nomRes, expRes] = await Promise.all([
          cliente.get('/empleados'),
          cliente.get('/departamentos'),
          cliente.get('/nomina/periodos'),
          cliente.get('/reportes/expedientes'),
        ]);

        const empleados = empRes.data;
        const departamentos = depRes.data;
        const periodos = nomRes.data;
        const expedientes = expRes.data;

        let expCompletos = 0;
        let expEnProceso = 0;
        let expIncompletos = 0;

        for (const dep of expedientes) {
          expCompletos += dep.completos || 0;
          expEnProceso += dep.enProceso || 0;
          expIncompletos += dep.incompletos || 0;
        }

        setStats({
          totalEmpleados: empleados.length,
          empleadosActivos: empleados.filter((e: any) => e.estadoLaboral === 'ACTIVO').length,
          empleadosSuspendidos: empleados.filter((e: any) => e.estadoLaboral === 'SUSPENDIDO').length,
          empleadosRetirados: empleados.filter((e: any) => e.estadoLaboral === 'RETIRADO').length,
          totalDepartamentos: departamentos.length,
          periodosAbiertos: periodos.filter((p: any) => p.estado === 'ABIERTO').length,
          periodosCerrados: periodos.filter((p: any) => p.estado === 'CERRADO').length,
          expedientesCompletos: expCompletos,
          expedientesEnProceso: expEnProceso,
          expedientesIncompletos: expIncompletos,
        });
      } catch {
        setError('Error al cargar estadísticas del dashboard');
      } finally {
        setCargando(false);
      }
    };

    cargarEstadisticas();
  }, []);

  if (cargando) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Dashboard</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* EMPLEADOS */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2E5090' }}>
        <People sx={{ mr: 1, verticalAlign: 'middle' }} />
        Empleados
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #2E5090' }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Total Empleados</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2E5090' }}>{stats.totalEmpleados}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #27ae60' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle sx={{ color: '#27ae60', fontSize: 20 }} />
                <Typography color="text.secondary" variant="body2">Activos</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#27ae60' }}>{stats.empleadosActivos}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #f39c12' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Warning sx={{ color: '#f39c12', fontSize: 20 }} />
                <Typography color="text.secondary" variant="body2">Suspendidos</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f39c12' }}>{stats.empleadosSuspendidos}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #e74c3c' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ErrorIcon sx={{ color: '#e74c3c', fontSize: 20 }} />
                <Typography color="text.secondary" variant="body2">Retirados</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>{stats.empleadosRetirados}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DEPARTAMENTOS Y NÓMINA */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2E5090' }}>
        <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
        Organización y Nómina
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #8e44ad' }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">Departamentos</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#8e44ad' }}>{stats.totalDepartamentos}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #27ae60' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AttachMoney sx={{ color: '#27ae60', fontSize: 20 }} />
                <Typography color="text.secondary" variant="body2">Períodos Abiertos</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#27ae60' }}>{stats.periodosAbiertos}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #7f8c8d' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AttachMoney sx={{ color: '#7f8c8d', fontSize: 20 }} />
                <Typography color="text.secondary" variant="body2">Períodos Cerrados</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#7f8c8d' }}>{stats.periodosCerrados}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* EXPEDIENTES */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2E5090' }}>
        <FolderOpen sx={{ mr: 1, verticalAlign: 'middle' }} />
        Expedientes
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderLeft: '4px solid #27ae60' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle sx={{ color: '#27ae60', fontSize: 20 }} />
                <Typography color="text.secondary" variant="body2">Completos</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#27ae60' }}>{stats.expedientesCompletos}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderLeft: '4px solid #f39c12' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Warning sx={{ color: '#f39c12', fontSize: 20 }} />
                <Typography color="text.secondary" variant="body2">En Proceso</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f39c12' }}>{stats.expedientesEnProceso}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderLeft: '4px solid #e74c3c' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ErrorIcon sx={{ color: '#e74c3c', fontSize: 20 }} />
                <Typography color="text.secondary" variant="body2">Incompletos</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>{stats.expedientesIncompletos}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}