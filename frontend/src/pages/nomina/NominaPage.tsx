import { useState, useEffect } from 'react';
import cliente from '../../api/cliente';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress,
  Tabs, Tab, IconButton, Card, CardContent
} from '@mui/material';
import { Add, Lock, Calculate, Edit } from '@mui/icons-material';

export default function NominaPage() {
  const [tab, setTab] = useState(0);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [dialogoPeriodo, setDialogoPeriodo] = useState(false);
  const [dialogoDetalle, setDialogoDetalle] = useState(false);
  const [dialogoAjuste, setDialogoAjuste] = useState(false);
  const [detalleAjuste, setDetalleAjuste] = useState<any>(null);
  const [formPeriodo, setFormPeriodo] = useState({
    tipoPeriodo: 'MENSUAL', fechaInicio: '', fechaFin: '',
  });
  const [formDetalle, setFormDetalle] = useState({
    periodoNominaId: 0, empleadoId: 0, horasExtra: 0, bonificaciones: 0, deducciones: 0,
  });
  const [formAjuste, setFormAjuste] = useState({
    detalleNominaId: 0, campo: 'horasExtra', valorNuevo: 0, motivo: '',
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [perRes, empRes] = await Promise.all([
        cliente.get('/nomina/periodos'),
        cliente.get('/empleados'),
      ]);
      setPeriodos(perRes.data);
      setEmpleados(empRes.data);
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
      await cliente.post('/nomina/periodos', formPeriodo);
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
            <Button variant="contained" startIcon={<Add />} onClick={() => setDialogoPeriodo(true)}>Nuevo Período</Button>
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
                    <TableCell>{new Date(per.fechaInicio).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(per.fechaFin).toLocaleDateString()}</TableCell>
                    <TableCell><Chip label={per.estado} color={per.estado === 'ABIERTO' ? 'success' : 'default'} size="small" /></TableCell>
                    <TableCell>{per.detalles?.length || 0}</TableCell>
                    <TableCell>
                      {per.estado === 'ABIERTO' && (
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
                        Período {periodoSeleccionado.tipoPeriodo}: {new Date(periodoSeleccionado.fechaInicio).toLocaleDateString()} - {new Date(periodoSeleccionado.fechaFin).toLocaleDateString()}
                      </Typography>
                      <Chip label={periodoSeleccionado.estado} color={periodoSeleccionado.estado === 'ABIERTO' ? 'success' : 'default'} size="small" sx={{ mt: 1 }} />
                    </Box>
                    {periodoSeleccionado.estado === 'ABIERTO' && (
                      <Button variant="contained" startIcon={<Add />} onClick={() => {
                        setFormDetalle({ ...formDetalle, periodoNominaId: periodoSeleccionado.id });
                        setDialogoDetalle(true);
                      }}>
                        Agregar Empleado
                      </Button>
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
                          {periodoSeleccionado.estado === 'ABIERTO' && (
                            <>
                              <IconButton color="primary" onClick={() => recalcular(det.id)} size="small" title="Recalcular"><Calculate /></IconButton>
                              <IconButton color="warning" onClick={() => abrirAjuste(det)} size="small" title="Ajustar"><Edit /></IconButton>
                            </>
                          )}
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
            <TextField select label="Tipo de Período" value={formPeriodo.tipoPeriodo} onChange={(e) => setFormPeriodo({ ...formPeriodo, tipoPeriodo: e.target.value })} fullWidth>
              <MenuItem value="MENSUAL">MENSUAL</MenuItem>
              <MenuItem value="QUINCENAL">QUINCENAL</MenuItem>
            </TextField>
            <TextField label="Fecha Inicio" type="date" value={formPeriodo.fechaInicio} onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaInicio: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Fecha Fin" type="date" value={formPeriodo.fechaFin} onChange={(e) => setFormPeriodo({ ...formPeriodo, fechaFin: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoPeriodo(false)}>Cancelar</Button>
          <Button variant="contained" onClick={crearPeriodo}>Crear</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogoDetalle} onClose={() => setDialogoDetalle(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Empleado a Nómina</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Empleado" value={formDetalle.empleadoId} onChange={(e) => setFormDetalle({ ...formDetalle, empleadoId: Number(e.target.value) })} fullWidth>
              {empleados.filter((e: any) => e.estadoLaboral !== 'RETIRADO').map((emp: any) => (
                <MenuItem key={emp.id} value={emp.id}>{emp.nombres} {emp.apellidos}</MenuItem>
              ))}
            </TextField>
            <TextField label="Horas Extra (Q)" type="number" value={formDetalle.horasExtra} onChange={(e) => setFormDetalle({ ...formDetalle, horasExtra: Number(e.target.value) })} fullWidth />
            <TextField label="Bonificaciones (Q)" type="number" value={formDetalle.bonificaciones} onChange={(e) => setFormDetalle({ ...formDetalle, bonificaciones: Number(e.target.value) })} fullWidth />
            <TextField label="Deducciones (Q)" type="number" value={formDetalle.deducciones} onChange={(e) => setFormDetalle({ ...formDetalle, deducciones: Number(e.target.value) })} fullWidth />
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
    </Box>
  );
}