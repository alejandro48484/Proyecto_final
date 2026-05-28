import { useState, useEffect, useRef } from 'react';
import cliente from '../../api/cliente';
import {
  Box, Typography, Card, CardContent, Button, TextField, MenuItem,
  Alert, CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tabs, Tab, LinearProgress
} from '@mui/material';
import { Assessment, People, School, CheckCircle, Download } from '@mui/icons-material';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function ReportesPage() {
  const [tab, setTab] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [periodoId, setPeriodoId] = useState('');
  const [datosNomina, setDatosNomina] = useState<any>(null);
  const [datosExpedientes, setDatosExpedientes] = useState<any[]>([]);
  const [datosAcademico, setDatosAcademico] = useState<any[]>([]);
  const [datosCumplimiento, setDatosCumplimiento] = useState<any>(null);

  const refNomina = useRef<HTMLDivElement>(null);
  const refExpedientes = useRef<HTMLDivElement>(null);
  const refAcademico = useRef<HTMLDivElement>(null);
  const refCumplimiento = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cargarPeriodos = async () => {
      try {
        const res = await cliente.get('/nomina/periodos');
        setPeriodos(res.data);
      } catch { }
    };
    cargarPeriodos();
  }, []);

  const periodoSeleccionado = periodos.find((p: any) => p.id === Number(periodoId));

  const cargarReporteNomina = async () => {
    if (!periodoId) return setError('Seleccione un período');
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

  const descargarPDF = (ref: React.RefObject<HTMLDivElement | null>, nombreArchivo: string) => {
    if (!ref.current) return;
    const opciones = {
      margin: 10,
      filename: `${nombreArchivo}_${new Date().toLocaleDateString('es-GT').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'landscape' as const },
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
              <TextField
                select
                label="Seleccionar Período"
                value={periodoId}
                onChange={(e) => setPeriodoId(e.target.value)}
                size="small"
                sx={{ minWidth: 350 }}
              >
                <MenuItem value="">-- Seleccione un período --</MenuItem>
                {periodos.map((per: any) => (
                  <MenuItem key={per.id} value={per.id}>
                    {per.tipoPeriodo} — {new Date(per.fechaInicio).toLocaleDateString('es-GT')} al {new Date(per.fechaFin).toLocaleDateString('es-GT')} ({per.estado})
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="contained" onClick={cargarReporteNomina} disabled={cargando}>
                {cargando ? <CircularProgress size={24} /> : 'Generar Reporte'}
              </Button>
              {datosNomina && !datosNomina.error && (
                <Button variant="contained" color="error" startIcon={<Download />} onClick={() => descargarPDF(refNomina, `reporte_nomina_${periodoSeleccionado?.tipoPeriodo}_${new Date(periodoSeleccionado?.fechaInicio).toLocaleDateString('es-GT')}`)}>
                  Descargar PDF
                </Button>
              )}
            </Box>
          </Paper>

          {datosNomina && !datosNomina.error && (
            <div ref={refNomina}>
              {/* ENCABEZADO DEL REPORTE */}
              <Box sx={{ textAlign: 'center', mb: 3, pb: 2, borderBottom: '2px solid #2E5090' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2E5090' }}>REPORTE DE NÓMINA</Typography>
                <Typography variant="h6">Empresa, S.A. — NIT: 000000-0</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Período: {periodoSeleccionado?.tipoPeriodo} — {new Date(periodoSeleccionado?.fechaInicio).toLocaleDateString('es-GT')} al {new Date(periodoSeleccionado?.fechaFin).toLocaleDateString('es-GT')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estado: {periodoSeleccionado?.estado} | Fecha de generación: {new Date().toLocaleDateString('es-GT')}
                </Typography>
              </Box>

              {/* TARJETAS RESUMEN */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Card sx={{ flex: 1, borderTop: '3px solid #2E5090' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Total Empleados</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{datosNomina.resumen.totalEmpleados}</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1, borderTop: '3px solid #2E5090' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Total Ingresos</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E5090' }}>Q{datosNomina.resumen.totalBruto.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1, borderTop: '3px solid #e74c3c' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Total Descuentos</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>Q{datosNomina.resumen.totalDeducciones.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1, borderTop: '3px solid #27ae60' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">Total Neto</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27ae60' }}>Q{datosNomina.resumen.totalNeto.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* TABLA DE INGRESOS */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#2E5090', backgroundColor: '#e8f0fe', p: 1, borderRadius: 1 }}>DETALLE DE INGRESOS</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#2E5090' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departamento</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Salario Base</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Bonificación Ley</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Horas Extra</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total Ingresos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datosNomina.detalles.map((d: any, i: number) => (
                      <TableRow key={i} hover>
                        <TableCell>{d.empleado}</TableCell>
                        <TableCell>{d.departamento}</TableCell>
                        <TableCell align="right">Q{d.salarioBase.toFixed(2)}</TableCell>
                        <TableCell align="right">Q{d.bonificaciones.toFixed(2)}</TableCell>
                        <TableCell align="right">Q{d.horasExtra.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Q{(d.salarioBase + d.bonificaciones + d.horasExtra).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#e8f4fd' }}>
                      <TableCell colSpan={5} sx={{ fontWeight: 'bold' }}>TOTAL INGRESOS</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Q{datosNomina.detalles.reduce((sum: number, d: any) => sum + d.salarioBase + d.bonificaciones + d.horasExtra, 0).toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* TABLA DE DESCUENTOS */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#e74c3c', backgroundColor: '#ffeaea', p: 1, borderRadius: 1 }}>DETALLE DE DESCUENTOS</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#c0392b' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departamento</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">IGSS (4.83%)</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">ISR</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total Descuentos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datosNomina.detalles.map((d: any, i: number) => (
                      <TableRow key={i} hover>
                        <TableCell>{d.empleado}</TableCell>
                        <TableCell>{d.departamento}</TableCell>
                        <TableCell align="right">Q{d.igss.toFixed(2)}</TableCell>
                        <TableCell align="right">Q{d.deducciones.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>Q{(d.igss + d.deducciones).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#ffeaea' }}>
                      <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>TOTAL DESCUENTOS</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>Q{datosNomina.detalles.reduce((sum: number, d: any) => sum + d.igss + d.deducciones, 0).toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* TABLA RESUMEN NETO */}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#27ae60', backgroundColor: '#e8f8e8', p: 1, borderRadius: 1 }}>RESUMEN - LÍQUIDO A RECIBIR</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#27ae60' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departamento</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total Ingresos</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Total Descuentos</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Líquido a Recibir</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datosNomina.detalles.map((d: any, i: number) => (
                      <TableRow key={i} hover>
                        <TableCell>{d.empleado}</TableCell>
                        <TableCell>{d.departamento}</TableCell>
                        <TableCell align="right">Q{(d.salarioBase + d.bonificaciones + d.horasExtra).toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ color: '#e74c3c' }}>Q{(d.igss + d.deducciones).toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#27ae60' }}>Q{d.salarioNeto.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#c6efce' }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>TOTALES GENERALES</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Q{datosNomina.detalles.reduce((sum: number, d: any) => sum + d.salarioBase + d.bonificaciones + d.horasExtra, 0).toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>Q{datosNomina.detalles.reduce((sum: number, d: any) => sum + d.igss + d.deducciones, 0).toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#27ae60' }}>Q{datosNomina.resumen.totalNeto.toFixed(2)}</TableCell>
                    </TableRow>
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
                              <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: emp.estado === 'COMPLETO' ? '#c6efce' : emp.estado === 'EN_PROCESO' ? '#ffeb9c' : '#ffc7ce', color: emp.estado === 'COMPLETO' ? '#0d7a3e' : emp.estado === 'EN_PROCESO' ? '#9c6500' : '#9c0006' }}>
                                {emp.estado}
                              </span>
                            </TableCell>
                            <TableCell>{emp.totalSubidos}/{emp.totalRequeridos}</TableCell>
                            <TableCell>{emp.documentosFaltantes.length > 0 ? emp.documentosFaltantes.map((d: string) => d.replace(/_/g, ' ')).join(', ') : 'Ninguno'}</TableCell>
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