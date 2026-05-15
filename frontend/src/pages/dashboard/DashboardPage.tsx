import { useState, useEffect } from 'react';
import cliente from '../../api/cliente';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert
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
    expedientesIncompletos: 0,
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const [empRes, depRes, nomRes, expRes] = await Promise.all([
          cliente.get('/empleados'),
          cliente.get('/departamentos'),
          cliente.get('/nomina/periodos'),
          cliente.get('/reportes/cumplimiento').catch(() => null),
        ]);

        const empleados = empRes.data;
        const departamentos = depRes.data;
        const periodos = nomRes.data;

        const activos = empleados.filter((e: any) => e.estadoLaboral === 'ACTIVO').length;
        const suspendidos = empleados.filter((e: any) => e.estadoLaboral === 'SUSPENDIDO').length;
        const retirados = empleados.filter((e: any) => e.estadoLaboral === 'RETIRADO').length;
        const abiertos = periodos.filter((p: any) => p.estado === 'ABIERTO').length;
        const cerrados = periodos.filter((p: any) => p.estado === 'CERRADO').length;

        let completos = 0, incompletos = 0;
        if (expRes?.data?.empleados) {
          completos = expRes.data.empleados.filter((e: any) => e.cumpleRequisitos).length;
          incompletos = expRes.data.empleados.filter((e: any) => !e.cumpleRequisitos).length;
        }

        setStats({
          totalEmpleados: empleados.length,
          empleadosActivos: activos,
          empleadosSuspendidos: suspendidos,
          empleadosRetirados: retirados,
          totalDepartamentos: departamentos.length,
          periodosAbiertos: abiertos,
          periodosCerrados: cerrados,
          expedientesCompletos: completos,
          expedientesIncompletos: incompletos,
        });
      } catch {
        setError('Error al cargar estadísticas');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Dashboard</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2E5090' }}>Empleados</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #2E5090' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Total Empleados</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.totalEmpleados}</Typography>
                </Box>
                <People sx={{ fontSize: 48, color: '#2E5090', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #27ae60' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Activos</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27ae60' }}>{stats.empleadosActivos}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, color: '#27ae60', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #f39c12' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Suspendidos</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f39c12' }}>{stats.empleadosSuspendidos}</Typography>
                </Box>
                <Warning sx={{ fontSize: 48, color: '#f39c12', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #e74c3c' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Retirados</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>{stats.empleadosRetirados}</Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 48, color: '#e74c3c', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2E5090' }}>Organización</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #8e44ad' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Departamentos</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#8e44ad' }}>{stats.totalDepartamentos}</Typography>
                </Box>
                <Business sx={{ fontSize: 48, color: '#8e44ad', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #27ae60' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Períodos Abiertos</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27ae60' }}>{stats.periodosAbiertos}</Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 48, color: '#27ae60', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #7f8c8d' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Períodos Cerrados</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7f8c8d' }}>{stats.periodosCerrados}</Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 48, color: '#7f8c8d', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2E5090' }}>Expedientes</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #27ae60' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Cumplen Requisitos</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27ae60' }}>{stats.expedientesCompletos}</Typography>
                </Box>
                <FolderOpen sx={{ fontSize: 48, color: '#27ae60', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #e74c3c' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">No Cumplen Requisitos</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>{stats.expedientesIncompletos}</Typography>
                </Box>
                <FolderOpen sx={{ fontSize: 48, color: '#e74c3c', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}