import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cliente from '../../api/cliente';
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert
} from '@mui/material';
import {
  People, Business, FolderOpen, AttachMoney,
  CheckCircle, Warning, Error as ErrorIcon,
  School, Assessment
} from '@mui/icons-material';
import { useRol } from '../../hooks/useRol';

export default function DashboardPage() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { esAdminOGestor } = useRol();
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
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Resumen del sistema — haga clic en cualquier tarjeta para ir al módulo</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2E5090' }}>Empleados</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #2E5090', cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }, transition: 'all 0.2s' }} onClick={() => navigate('/empleados')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Total Empleados</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.totalEmpleados}</Typography>
                  <Typography variant="caption" color="primary">Ver empleados →</Typography>
                </Box>
                <People sx={{ fontSize: 48, color: '#2E5090', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #27ae60', cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }, transition: 'all 0.2s' }} onClick={() => navigate('/empleados')}>
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

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2E5090' }}>Módulos del Sistema</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #8e44ad', cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }, transition: 'all 0.2s' }} onClick={() => navigate('/departamentos')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Departamentos</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#8e44ad' }}>{stats.totalDepartamentos}</Typography>
                  <Typography variant="caption" color="primary">Ver departamentos →</Typography>
                </Box>
                <Business sx={{ fontSize: 48, color: '#8e44ad', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #27ae60', cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }, transition: 'all 0.2s' }} onClick={() => navigate('/nomina')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Períodos Abiertos</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27ae60' }}>{stats.periodosAbiertos}</Typography>
                  <Typography variant="caption" color="primary">Ir a nómina →</Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 48, color: '#27ae60', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        {esAdminOGestor && (
          <Box sx={{ flex: '1 1 200px' }}>
            <Card sx={{ borderLeft: '4px solid #e67e22', cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }, transition: 'all 0.2s' }} onClick={() => navigate('/academico')}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">Info Académica</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#e67e22' }}>Títulos y certificaciones</Typography>
                    <Typography variant="caption" color="primary">Ver académico →</Typography>
                  </Box>
                  <School sx={{ fontSize: 48, color: '#e67e22', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
        {esAdminOGestor && (
          <Box sx={{ flex: '1 1 200px' }}>
            <Card sx={{ borderLeft: '4px solid #2980b9', cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }, transition: 'all 0.2s' }} onClick={() => navigate('/reportes')}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">Reportes</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2980b9' }}>Nómina, expedientes, académico</Typography>
                    <Typography variant="caption" color="primary">Ver reportes →</Typography>
                  </Box>
                  <Assessment sx={{ fontSize: 48, color: '#2980b9', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2E5090' }}>Expedientes</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #27ae60', cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }, transition: 'all 0.2s' }} onClick={() => navigate('/expediente')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Cumplen Requisitos</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27ae60' }}>{stats.expedientesCompletos}</Typography>
                  <Typography variant="caption" color="primary">Ver expedientes →</Typography>
                </Box>
                <FolderOpen sx={{ fontSize: 48, color: '#27ae60', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Card sx={{ borderLeft: '4px solid #e74c3c', cursor: 'pointer', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }, transition: 'all 0.2s' }} onClick={() => navigate('/expediente')}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">No Cumplen Requisitos</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>{stats.expedientesIncompletos}</Typography>
                  <Typography variant="caption" color="primary">Ver expedientes →</Typography>
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