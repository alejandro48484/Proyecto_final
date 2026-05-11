import { useState, useRef } from 'react';
import cliente from '../../api/cliente';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  Alert, CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Tabs, Tab, LinearProgress
} from '@mui/material';
import { Assessment, People, School, CheckCircle, Download } from '@mui/icons-material';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function ReportesPage() {
  const [tab, setTab] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [periodoId, setPeriodoId] = useState('');
  const [datosNomina, setDatosNomina] = useState<any>(null);
  const [datosExpedientes, setDatosExpedientes] = useState<any[]>([]);
  const [datosAcademico, setDatosAcademico] = useState<any[]>([]);
  const [datosCumplimiento, setDatosCumplimiento] = useState<any>(null);

  const refNomina = useRef<HTMLDivElement>(null);
  const refExpedientes = useRef<HTMLDivElement>(null);
  const refAcademico = useRef<HTMLDivElement>(null);
  const refCumplimiento = useRef<HTMLDivElement>(null);

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

  const descargarPDF = (ref: React.RefObject<HTMLDivElement>, nombreArchivo: string) => {
    if (!ref.current) return;
    const opciones = {
      margin: 10,
      filename: `${nombreArchivo}_${new Date().toLocaleDateString('es-GT').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    };
    html2pdf().set(opciones).from(ref.current).save();
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
              {datosNomina && !datosNomina.error && (
                <Button variant="contained" color="error" startIcon={<Download />} onClick={() => descargarPDF(refNomina, 'reporte_nomina')}>
                  Descargar PDF
                </Button>
              )}
            </Box>
          </Paper>

          {datosNomina && !datosNomina.error && (
            <div ref={refNomina}>
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
            </div>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button variant="contained" onClick={cargarReporteExpedientes} disabled={cargando}>
              {cargando ? <CircularProgress size={24} /> : 'Generar Reporte de Expedientes'}
            </Button>
            {datosExpedientes.length > 0 && (
              <Button variant="contained" color="error" startIcon={<Download />} onClick={() => descargarPDF(refExpedientes, 'reporte_expedientes')}>
                Descargar PDF
              </Button>
            )}
          </Box>

          <div ref={refExpedientes}>
            {datosExpedientes.map((dep: any, i: number) => (
              <Card key={i} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{dep.departamento}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#c6efce', color: '#0d7a3e' }}>{dep.completos} Completos</span>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#ffeb9c', color: '#9c6500' }}>{dep.enProceso} En Proceso</span>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#ffc7ce', color: '#9c0006' }}>{dep.incompletos} Incompletos</span>
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
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                backgroundColor: emp.estado === 'COMPLETO' ? '#c6efce' : emp.estado === 'EN_PROCESO' ? '#ffeb9c' : '#ffc7ce',
                                color: emp.estado === 'COMPLETO' ? '#0d7a3e' : emp.estado === 'EN_PROCESO' ? '#9c6500' : '#9c0006',
                              }}>
                                {emp.estado}
                              </span>
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
          </div>
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button variant="contained" onClick={cargarReporteAcademico} disabled={cargando}>
              {cargando ? <CircularProgress size={24} /> : 'Generar Reporte Académico'}
            </Button>
            {datosAcademico.length > 0 && (
              <Button variant="contained" color="error" startIcon={<Download />} onClick={() => descargarPDF(refAcademico, 'reporte_academico')}>
                Descargar PDF
              </Button>
            )}
          </Box>

          <div ref={refAcademico}>
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
                        <TableCell>
                          <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#d0e4ff', color: '#2E5090' }}>
                            {emp.totalTitulos}
                          </span>
                        </TableCell>
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
          </div>
        </Box>
      )}

      {tab === 3 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button variant="contained" onClick={cargarReporteCumplimiento} disabled={cargando}>
              {cargando ? <CircularProgress size={24} /> : 'Generar Reporte de Cumplimiento'}
            </Button>
            {datosCumplimiento && (
              <Button variant="contained" color="error" startIcon={<Download />} onClick={() => descargarPDF(refCumplimiento, 'reporte_cumplimiento')}>
                Descargar PDF
              </Button>
            )}
          </Box>

          <div ref={refCumplimiento}>
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
                            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: emp.expedienteCompleto ? '#c6efce' : '#ffc7ce', color: emp.expedienteCompleto ? '#0d7a3e' : '#9c0006' }}>
                              {emp.expedienteCompleto ? 'Completo' : 'Incompleto'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: emp.tieneTituloAcademico ? '#c6efce' : '#ffc7ce', color: emp.tieneTituloAcademico ? '#0d7a3e' : '#9c0006' }}>
                              {emp.tieneTituloAcademico ? 'Sí' : 'No'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: emp.cumpleRequisitos ? '#c6efce' : '#ffc7ce', color: emp.cumpleRequisitos ? '#0d7a3e' : '#9c0006' }}>
                              {emp.cumpleRequisitos ? 'Sí' : 'No'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </div>
        </Box>
      )}
    </Box>
  );
}