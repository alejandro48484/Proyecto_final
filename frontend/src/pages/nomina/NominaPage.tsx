import { useState, useEffect, useRef } from 'react';
import cliente from '../../api/cliente';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress,
  Tabs, Tab, IconButton, Card, CardContent
} from '@mui/material';
import { Add, Lock, Calculate, Edit, Receipt, Group, GroupAdd } from '@mui/icons-material';
import { useRol } from '../../hooks/useRol';

export default function NominaPage() {
  const [tab, setTab] = useState(0);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoMasivo, setCargandoMasivo] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [dialogoPeriodo, setDialogoPeriodo] = useState(false);
  const [dialogoDetalle, setDialogoDetalle] = useState(false);
  const [dialogoAjuste, setDialogoAjuste] = useState(false);
  const [dialogoVoucher, setDialogoVoucher] = useState(false);
  const [dialogoMasivo, setDialogoMasivo] = useState(false);
  const [departamentoFiltro, setDepartamentoFiltro] = useState('');
  const [datosVoucher, setDatosVoucher] = useState<any>(null);
  const [cargandoVoucher, setCargandoVoucher] = useState(false);
  const [, setDetalleAjuste] = useState<any>(null);
  const { esAdminOGestor, esAdmin } = useRol();
  const refVoucher = useRef<HTMLDivElement>(null);

  const [tipoPeriodo, setTipoPeriodo] = useState('MENSUAL');
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [quincena, setQuincena] = useState<number>(1);

  const [formDetalle, setFormDetalle] = useState({
    periodoNominaId: 0, empleadoId: 0, horasExtra: 0, bonificaciones: 0, deducciones: 0,
  });
  const [formAjuste, setFormAjuste] = useState({
    detalleNominaId: 0, campo: 'horasExtra', valorNuevo: 0, motivo: '',
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [perRes, empRes, depRes] = await Promise.all([
        cliente.get('/nomina/periodos'),
        cliente.get('/empleados'),
        cliente.get('/departamentos'),
      ]);
      setPeriodos(perRes.data);
      setEmpleados(empRes.data);
      setDepartamentos(depRes.data);
    } catch {
      setError('Error al cargar datos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const cargarPeriodo = async (id: number) => {
    try {
      const res = await cliente.get(`/nomina/periodos/${id}`);
      setPeriodoSeleccionado(res.data);
    } catch {
      setError('Error al cargar período');
    }
  };

  const crearPeriodo = async () => {
    try {
      setError('');
      const datos: any = { tipoPeriodo, mes, anio };
      if (tipoPeriodo === 'QUINCENAL') datos.quincena = quincena;
      await cliente.post('/nomina/periodos', datos);
      setExito('Período creado exitosamente');
      setDialogoPeriodo(false);
      cargarDatos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear período');
    }
  };

  const cerrarPeriodo = async (id: number) => {
    if (!confirm('¿Está seguro de cerrar este período? No podrá modificarlo después.')) return;
    try {
      await cliente.patch(`/nomina/periodos/${id}/cerrar`);
      setExito('Período cerrado');
      cargarDatos();
      if (periodoSeleccionado?.id === id) cargarPeriodo(id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cerrar período');
    }
  };

  const agregarDetalle = async () => {
    try {
      setError('');
      await cliente.post('/nomina/detalles', formDetalle);
      setExito('Detalle agregado exitosamente');
      setDialogoDetalle(false);
      if (formDetalle.periodoNominaId) cargarPeriodo(formDetalle.periodoNominaId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al agregar detalle');
    }
  };

  const agregarMasivo = async () => {
    if (!periodoSeleccionado) return;
    try {
      setCargandoMasivo(true);
      setError('');

      const empleadosFiltrados = empleados.filter((e: any) => {
        if (e.estadoLaboral === 'RETIRADO') return false;
        if (departamentoFiltro) return e.departamentoId === Number(departamentoFiltro);
        return true;
      });

      const yaEnNomina = periodoSeleccionado.detalles?.map((d: any) => d.empleadoId) || [];
      const empleadosNuevos = empleadosFiltrados.filter((e: any) => !yaEnNomina.includes(e.id));

      if (empleadosNuevos.length === 0) {
        setError('Todos los empleados seleccionados ya están en este período');
        setCargandoMasivo(false);
        return;
      }

      let exitosos = 0;
      for (const emp of empleadosNuevos) {
        try {
          await cliente.post('/nomina/detalles', {
            periodoNominaId: periodoSeleccionado.id,
            empleadoId: emp.id,
            horasExtra: 0,
            bonificaciones: 0,
            deducciones: 0,
          });
          exitosos++;
        } catch {
          // continuar con los demás
        }
      }

      setExito(`${exitosos} empleado(s) agregado(s) exitosamente`);
      setDialogoMasivo(false);
      setDepartamentoFiltro('');
      cargarPeriodo(periodoSeleccionado.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al agregar empleados');
    } finally {
      setCargandoMasivo(false);
    }
  };

  const recalcular = async (id: number) => {
    try {
      await cliente.patch(`/nomina/detalles/${id}/recalcular`);
      setExito('Recalculado exitosamente');
      if (periodoSeleccionado) cargarPeriodo(periodoSeleccionado.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al recalcular');
    }
  };

  const abrirAjuste = (detalle: any) => {
    setDetalleAjuste(detalle);
    setFormAjuste({ detalleNominaId: detalle.id, campo: 'horasExtra', valorNuevo: 0, motivo: '' });
    setDialogoAjuste(true);
  };

  const realizarAjuste = async () => {
    try {
      setError('');
      await cliente.post('/nomina/ajustes', formAjuste);
      setExito('Ajuste realizado exitosamente');
      setDialogoAjuste(false);
      if (periodoSeleccionado) cargarPeriodo(periodoSeleccionado.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al realizar ajuste');
    }
  };

  const verVoucher = async (empleadoId: number) => {
    if (!periodoSeleccionado) return;
    try {
      setCargandoVoucher(true);
      const res = await cliente.get(`/reportes/voucher/${periodoSeleccionado.id}/${empleadoId}`);
      setDatosVoucher(res.data.voucher);
      setDialogoVoucher(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar voucher');
    } finally {
      setCargandoVoucher(false);
    }
  };

  const descargarVoucherPDF = () => {
    if (!refVoucher.current) return;
    html2pdf().set({
      margin: 10,
      filename: `voucher_${datosVoucher?.empleado?.nombre}_${datosVoucher?.periodo?.tipo}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    }).from(refVoucher.current).save();
  };

  const empleadosFiltradosPreview = empleados.filter((e: any) => {
    if (e.estadoLaboral === 'RETIRADO') return false;
    if (departamentoFiltro) return e.departamentoId === Number(departamentoFiltro);
    return true;
  });

  if (cargando) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Gestión de Nómina</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {exito && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setExito('')}>{exito}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Períodos" />
        <Tab label="Detalle de Nómina" />
      </Tabs>

      {tab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            {esAdminOGestor && <Button variant="contained" startIcon={<Add />} onClick={() => setDialogoPeriodo(true)}>Nuevo Período</Button>}
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#2E5090' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha Inicio</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha Fin</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleados</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {periodos.map((per: any) => (
                  <TableRow key={per.id} hover sx={{ cursor: 'pointer' }} onClick={() => { cargarPeriodo(per.id); setTab(1); }}>
                    <TableCell>{per.id}</TableCell>
                    <TableCell>{per.tipoPeriodo}</TableCell>
                    <TableCell>{new Date(per.fechaInicio).toLocaleDateString('es-GT')}</TableCell>
                    <TableCell>{new Date(per.fechaFin).toLocaleDateString('es-GT')}</TableCell>
                    <TableCell><Chip label={per.estado} color={per.estado === 'ABIERTO' ? 'success' : 'default'} size="small" /></TableCell>
                    <TableCell>{per.detalles?.length || 0}</TableCell>
                    <TableCell>
                      {per.estado === 'ABIERTO' && esAdmin && (
                        <IconButton color="warning" onClick={(e) => { e.stopPropagation(); cerrarPeriodo(per.id); }} size="small" title="Cerrar período">
                          <Lock />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tab === 1 && (
        <>
          {!periodoSeleccionado ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Seleccioná un período en la pestaña "Períodos" para ver el detalle</Typography>
            </Paper>
          ) : (
            <>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">
                        Período {periodoSeleccionado.tipoPeriodo}: {new Date(periodoSeleccionado.fechaInicio).toLocaleDateString('es-GT')} - {new Date(periodoSeleccionado.fechaFin).toLocaleDateString('es-GT')}
                      </Typography>
                      <Chip label={periodoSeleccionado.estado} color={periodoSeleccionado.estado === 'ABIERTO' ? 'success' : 'default'} size="small" sx={{ mt: 1 }} />
                    </Box>
                    {periodoSeleccionado.estado === 'ABIERTO' && esAdminOGestor && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined" startIcon={<Group />} onClick={() => setDialogoMasivo(true)}>
                          Agregar por Departamento
                        </Button>
                        <Button variant="contained" startIcon={<GroupAdd />} onClick={() => {
                          setDepartamentoFiltro('');
                          setDialogoMasivo(true);
                        }}>
                          Agregar Todos
                        </Button>
                        <Button variant="contained" color="secondary" startIcon={<Add />} onClick={() => {
                          setFormDetalle({ ...formDetalle, periodoNominaId: periodoSeleccionado.id });
                          setDialogoDetalle(true);
                        }}>
                          Agregar Individual
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#2E5090' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Salario Base</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Horas Extra</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Bonificaciones</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Deducciones</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">IGSS</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">IRTRA</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Salario Neto</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {periodoSeleccionado.detalles?.map((det: any) => (
                      <TableRow key={det.id} hover>
                        <TableCell>{det.empleado?.nombres} {det.empleado?.apellidos}</TableCell>
                        <TableCell align="right">Q{Number(det.salarioBase).toFixed(2)}</TableCell>
                        <TableCell align="right">Q{Number(det.horasExtra).toFixed(2)}</TableCell>
                        <TableCell align="right">Q{Number(det.bonificaciones).toFixed(2)}</TableCell>
                        <TableCell align="right">Q{Number(det.deducciones).toFixed(2)}</TableCell>
                        <TableCell align="right">Q{Number(det.igss).toFixed(2)}</TableCell>
                        <TableCell align="right">Q{Number(det.irtra).toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Q{Number(det.salarioNeto).toFixed(2)}</TableCell>
                        <TableCell>
                          {periodoSeleccionado.estado === 'ABIERTO' && esAdminOGestor && (
                            <>
                              <IconButton color="primary" onClick={() => recalcular(det.id)} size="small" title="Recalcular"><Calculate /></IconButton>
                              <IconButton color="warning" onClick={() => abrirAjuste(det)} size="small" title="Ajustar"><Edit /></IconButton>
                            </>
                          )}
                          <IconButton color="success" onClick={() => verVoucher(det.empleado?.id)} size="small" title="Ver voucher">
                            <Receipt />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </>
      )}

      <Dialog open={dialogoPeriodo} onClose={() => setDialogoPeriodo(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Período de Nómina</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Tipo de Período" value={tipoPeriodo} onChange={(e) => setTipoPeriodo(e.target.value)} fullWidth>
              <MenuItem value="MENSUAL">MENSUAL</MenuItem>
              <MenuItem value="QUINCENAL">QUINCENAL</MenuItem>
            </TextField>
            <TextField select label="Mes" value={mes} onChange={(e) => setMes(Number(e.target.value))} fullWidth>
              <MenuItem value={1}>Enero</MenuItem>
              <MenuItem value={2}>Febrero</MenuItem>
              <MenuItem value={3}>Marzo</MenuItem>
              <MenuItem value={4}>Abril</MenuItem>
              <MenuItem value={5}>Mayo</MenuItem>
              <MenuItem value={6}>Junio</MenuItem>
              <MenuItem value={7}>Julio</MenuItem>
              <MenuItem value={8}>Agosto</MenuItem>
              <MenuItem value={9}>Septiembre</MenuItem>
              <MenuItem value={10}>Octubre</MenuItem>
              <MenuItem value={11}>Noviembre</MenuItem>
              <MenuItem value={12}>Diciembre</MenuItem>
            </TextField>
            <TextField select label="Año" value={anio} onChange={(e) => setAnio(Number(e.target.value))} fullWidth>
              <MenuItem value={2025}>2025</MenuItem>
              <MenuItem value={2026}>2026</MenuItem>
              <MenuItem value={2027}>2027</MenuItem>
            </TextField>
            {tipoPeriodo === 'QUINCENAL' && (
              <TextField select label="Quincena" value={quincena} onChange={(e) => setQuincena(Number(e.target.value))} fullWidth>
                <MenuItem value={1}>Primera quincena (1 al 15)</MenuItem>
                <MenuItem value={2}>Segunda quincena (16 al último día)</MenuItem>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoPeriodo(false)}>Cancelar</Button>
          <Button variant="contained" onClick={crearPeriodo}>Crear</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogoMasivo} onClose={() => { setDialogoMasivo(false); setDepartamentoFiltro(''); }} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Empleados a Nómina</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Filtrar por departamento (opcional)" value={departamentoFiltro} onChange={(e) => setDepartamentoFiltro(e.target.value)} fullWidth>
              <MenuItem value="">Todos los departamentos</MenuItem>
              {departamentos.map((d: any) => (
                <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>
              ))}
            </TextField>
            <Alert severity="info">
              Se agregarán <strong>{empleadosFiltradosPreview.length}</strong> empleado(s) {departamentoFiltro ? `del departamento seleccionado` : `de todos los departamentos`}. Los que ya estén en el período serán omitidos.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogoMasivo(false); setDepartamentoFiltro(''); }}>Cancelar</Button>
          <Button variant="contained" onClick={agregarMasivo} disabled={cargandoMasivo}>
            {cargandoMasivo ? <CircularProgress size={24} /> : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogoDetalle} onClose={() => setDialogoDetalle(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Empleado Individual a Nómina</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Empleado" value={formDetalle.empleadoId} onChange={(e) => setFormDetalle({ ...formDetalle, empleadoId: Number(e.target.value) })} fullWidth>
              {empleados.filter((e: any) => e.estadoLaboral !== 'RETIRADO').map((emp: any) => (
                <MenuItem key={emp.id} value={emp.id}>{emp.nombres} {emp.apellidos}</MenuItem>
              ))}
            </TextField>
            <TextField label="Horas Extra (Q)" type="number" value={formDetalle.horasExtra} onChange={(e) => setFormDetalle({ ...formDetalle, horasExtra: Number(e.target.value) })} fullWidth />
            <TextField label="Bonificaciones (Q)" type="number" value={formDetalle.bonificaciones} onChange={(e) => setFormDetalle({ ...formDetalle, bonificaciones: Number(e.target.value) })} fullWidth />
            <TextField label="Deducciones adicionales (Q)" type="number" value={formDetalle.deducciones} onChange={(e) => setFormDetalle({ ...formDetalle, deducciones: Number(e.target.value) })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoDetalle(false)}>Cancelar</Button>
          <Button variant="contained" onClick={agregarDetalle}>Agregar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogoAjuste} onClose={() => setDialogoAjuste(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajuste Manual de Nómina</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Campo a Ajustar" value={formAjuste.campo} onChange={(e) => setFormAjuste({ ...formAjuste, campo: e.target.value })} fullWidth>
              <MenuItem value="horasExtra">Horas Extra</MenuItem>
              <MenuItem value="bonificaciones">Bonificaciones</MenuItem>
              <MenuItem value="deducciones">Deducciones</MenuItem>
            </TextField>
            <TextField label="Nuevo Valor (Q)" type="number" value={formAjuste.valorNuevo} onChange={(e) => setFormAjuste({ ...formAjuste, valorNuevo: Number(e.target.value) })} fullWidth />
            <TextField label="Motivo del Ajuste" value={formAjuste.motivo} onChange={(e) => setFormAjuste({ ...formAjuste, motivo: e.target.value })} fullWidth multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoAjuste(false)}>Cancelar</Button>
          <Button variant="contained" onClick={realizarAjuste}>Aplicar Ajuste</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogoVoucher} onClose={() => setDialogoVoucher(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Voucher de Nómina
            <Button variant="contained" color="error" size="small" onClick={descargarVoucherPDF}>
              Descargar PDF
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {cargandoVoucher ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
          ) : datosVoucher && (
            <div ref={refVoucher}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 2, color: '#2E5090' }}>
                  VOUCHER DE PAGO
                </Typography>
                <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2"><strong>Empleado:</strong> {datosVoucher.empleado?.nombre}</Typography>
                  <Typography variant="body2"><strong>Cargo:</strong> {datosVoucher.empleado?.cargo}</Typography>
                  <Typography variant="body2"><strong>Departamento:</strong> {datosVoucher.empleado?.departamento}</Typography>
                  <Typography variant="body2"><strong>DPI:</strong> {datosVoucher.empleado?.dpi}</Typography>
                </Box>
                <Box sx={{ mb: 2, p: 2, backgroundColor: '#e8f4fd', borderRadius: 1 }}>
                  <Typography variant="body2"><strong>Período:</strong> {datosVoucher.periodo?.tipo}</Typography>
                  <Typography variant="body2"><strong>Fecha inicio:</strong> {new Date(datosVoucher.periodo?.fechaInicio).toLocaleDateString('es-GT')}</Typography>
                  <Typography variant="body2"><strong>Fecha fin:</strong> {new Date(datosVoucher.periodo?.fechaFin).toLocaleDateString('es-GT')}</Typography>
                </Box>
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Salario Base</TableCell>
                        <TableCell align="right">Q{Number(datosVoucher.desglose?.salarioBase).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Horas Extra</TableCell>
                        <TableCell align="right">Q{Number(datosVoucher.desglose?.horasExtra).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Bonificaciones</TableCell>
                        <TableCell align="right">Q{Number(datosVoucher.desglose?.bonificaciones).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: '#e8f4fd' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Total Bruto</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Q{Number(datosVoucher.desglose?.totalBruto).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }}>IGSS (4.83%)</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>-Q{Number(datosVoucher.desglose?.igss).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }}>IRTRA (1%)</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>-Q{Number(datosVoucher.desglose?.irtra).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }}>Otras deducciones</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>-Q{Number(datosVoucher.desglose?.deducciones).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: '#ffeaea' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }}>Total Deducciones</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>-Q{Number(datosVoucher.desglose?.totalDeducciones).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: '#c6efce' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>SALARIO NETO</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0d7a3e' }}>Q{Number(datosVoucher.desglose?.salarioNeto).toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoVoucher(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}