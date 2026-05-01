import { useState } from 'react';
import cliente from '../../api/cliente';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Alert, CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Tabs, Tab, LinearProgress
} from '@mui/material';
import { Assessment, People, School, CheckCircle } from '@mui/icons-material';

export default function ReportesPage() {
  const [tab, setTab] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [periodoId, setPeriodoId] = useState('');
  const [datosNomina, setDatosNomina] = useState<any>(null);
  const [datosExpedientes, setDatosExpedientes] = useState<any[]>([]);
  const [datosAcademico, setDatosAcademico] = useState<any[]>([]);
  const [datosCumplimiento, setDatosCumplimiento] = useState<any>(null);

  const cargarReporteNomina = async () => {
    if (!periodoId) return setError('Ingrese el ID del período');
    try {
      setCargando(true);
      setError('');
      const res = await cliente.get(`/reportes/nomina/${periodoId}`);
      setDatosNomina(res.data);
    } catch {
      setError('Error al cargar reporte de nómina');
    } finally {
      setCargando(false);
    }
  };

  const cargarReporteExpedientes = async () => {
    try {
      setCargando(true);
      setError('');
      const res = await cliente.get('/reportes/expedientes');
      setDatosExpedientes(res.data);
    } catch {
      setError('Error al cargar reporte de expedientes');
    } finally {
      setCargando(false);
    }
  };

  const cargarReporteAcademico = async () => {
    try {
      setCargando(true);
      setError('');
      const res = await cliente.get('/reportes/academico');
      setDatosAcademico(res.data);
    } catch {
      setError('Error al cargar reporte académico');
    } finally {
      setCargando(false);
    }
  };

  const cargarReporteCumplimiento = async () => {
    try {
      setCargando(true);
      setError('');
      const res = await cliente.get('/reportes/cumplimiento');
      setDatosCumplimiento(res.data);
    } catch {
      setError('Error al cargar reporte de cumplimiento');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Reportes</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<Assessment />} label="Nómina" />
        <Tab icon={<People />} label="Expedientes" />
        <Tab icon={<School />} label="Académico" />
        <Tab icon={<CheckCircle />} label="Cumplimiento" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField label="ID del Período" type="number" value={periodoId} onChange={(e) => setPeriodoId(e.target.value)} size="small" />
              <Button variant="contained" onClick={cargarReporteNomina} disabled={cargando}>
                {cargando ? <CircularProgress size={24} /> : 'Generar Reporte'}
              </Button>
            </Box>
          </Paper>

          {datosNomina && !datosNomina.error && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Total Empleados</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{datosNomina.resumen.totalEmpleados}</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Total Bruto</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E5090' }}>Q{datosNomina.resumen.totalBruto.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Total Deducciones</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>Q{datosNomina.resumen.totalDeducciones.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Total Neto</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27ae60' }}>Q{datosNomina.resumen.totalNeto.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#2E5090' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departamento</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Salario Base</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Horas Extra</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Bonificaciones</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Deducciones</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">IGSS</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">IRTRA</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Neto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datosNomina.detalles.map((d: any, i: number) => (
                      <TableRow key={i} hover>
                        <TableCell>{d.empleado}</TableCell>
                        <TableCell>{d.departamento}</TableCell>
                        <TableCell align="right">Q{d.salarioBase.toFixed(2)}</TableCell>
                        <TableCell align="right">Q{d.horasExtra.toFixed(2)}</TableCell>
                        <TableCell align="right">Q{d.bonificaciones.toFixed(2)}</TableCell>
                        <TableCell align="right">Q{d.deducciones.toFixed(2)}</TableCell>
                        <TableCell align="right">Q{d.igss.toFixed(2)}</TableCell>
                        <TableCell align="right">Q{d.irtra.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Q{d.salarioNeto.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Button variant="contained" onClick={cargarReporteExpedientes} disabled={cargando} sx={{ mb: 3 }}>
            {cargando ? <CircularProgress size={24} /> : 'Generar Reporte de Expedientes'}
          </Button>

          {datosExpedientes.map((dep: any, i: number) => (
            <Card key={i} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{dep.departamento}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`${dep.completos} Completos`} color="success" size="small" />
                    <Chip label={`${dep.enProceso} En Proceso`} color="warning" size="small" />
                    <Chip label={`${dep.incompletos} Incompletos`} color="error" size="small" />
                  </Box>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Empleado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Subidos</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Faltantes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dep.empleados.map((emp: any) => (
                        <TableRow key={emp.id} hover>
                          <TableCell>{emp.nombre}</TableCell>
                          <TableCell>
                            <Chip label={emp.estado} size="small"
                              color={emp.estado === 'COMPLETO' ? 'success' : emp.estado === 'EN_PROCESO' ? 'warning' : 'error'} />
                          </TableCell>
                          <TableCell>{emp.totalSubidos}/{emp.totalRequeridos}</TableCell>
                          <TableCell>
                            {emp.documentosFaltantes.length > 0
                              ? emp.documentosFaltantes.map((d: string) => d.replace(/_/g, ' ')).join(', ')
                              : 'Ninguno'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Button variant="contained" onClick={cargarReporteAcademico} disabled={cargando} sx={{ mb: 3 }}>
            {cargando ? <CircularProgress size={24} /> : 'Generar Reporte Académico'}
          </Button>

          {datosAcademico.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#2E5090' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleado</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departamento</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cargo</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Títulos</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Detalle</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datosAcademico.map((emp: any) => (
                    <TableRow key={emp.id} hover>
                      <TableCell>{emp.nombre}</TableCell>
                      <TableCell>{emp.departamento}</TableCell>
                      <TableCell>{emp.cargo}</TableCell>
                      <TableCell><Chip label={emp.totalTitulos} color="primary" size="small" /></TableCell>
                      <TableCell>
                        {emp.titulos.map((t: any, i: number) => (
                          <Typography key={i} variant="body2">
                            {t.titulo} - {t.institucion} {t.certificacion ? `(${t.certificacion})` : ''}
                          </Typography>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {tab === 3 && (
        <Box>
          <Button variant="contained" onClick={cargarReporteCumplimiento} disabled={cargando} sx={{ mb: 3 }}>
            {cargando ? <CircularProgress size={24} /> : 'Generar Reporte de Cumplimiento'}
          </Button>

          {datosCumplimiento && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Total Empleados</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{datosCumplimiento.totalEmpleados}</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Cumplen Requisitos</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27ae60' }}>{datosCumplimiento.cumplen}</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">No Cumplen</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>{datosCumplimiento.noCumplen}</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">% Cumplimiento</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E5090' }}>{datosCumplimiento.porcentajeCumplimiento}%</Typography>
                    <LinearProgress variant="determinate" value={datosCumplimiento.porcentajeCumplimiento} sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#2E5090' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departamento</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cargo</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Expediente</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Título</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cumple</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datosCumplimiento.empleados.map((emp: any) => (
                      <TableRow key={emp.id} hover>
                        <TableCell>{emp.nombre}</TableCell>
                        <TableCell>{emp.departamento}</TableCell>
                        <TableCell>{emp.cargo}</TableCell>
                        <TableCell>
                          <Chip label={emp.expedienteCompleto ? 'Completo' : 'Incompleto'}
                            color={emp.expedienteCompleto ? 'success' : 'error'} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={emp.tieneTituloAcademico ? 'Sí' : 'No'}
                            color={emp.tieneTituloAcademico ? 'success' : 'error'} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={emp.cumpleRequisitos ? 'Sí' : 'No'}
                            color={emp.cumpleRequisitos ? 'success' : 'error'} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}