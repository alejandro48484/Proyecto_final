import { useState, useEffect } from 'react';
import cliente from '../../api/cliente';
import type { Empleado, Departamento } from '../../types';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, SwapHoriz } from '@mui/icons-material';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [dialogoEstado, setDialogoEstado] = useState(false);
  const [editando, setEditando] = useState<Empleado | null>(null);
  const [empleadoEstado, setEmpleadoEstado] = useState<Empleado | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [formulario, setFormulario] = useState({
    nombres: '', apellidos: '', fechaNacimiento: '', direccion: '',
    telefono: '', correo: '', numeroDpi: '', salarioBase: 0,
    cargo: '', departamentoId: 0, estadoLaboral: 'ACTIVO',
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [empRes, depRes] = await Promise.all([
        cliente.get('/empleados'),
        cliente.get('/departamentos'),
      ]);
      setEmpleados(empRes.data);
      setDepartamentos(depRes.data);
    } catch {
      setError('Error al cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setFormulario({
      nombres: '', apellidos: '', fechaNacimiento: '', direccion: '',
      telefono: '', correo: '', numeroDpi: '', salarioBase: 0,
      cargo: '', departamentoId: departamentos[0]?.id || 0, estadoLaboral: 'ACTIVO',
    });
    setDialogoAbierto(true);
  };

  const abrirEditar = (emp: Empleado) => {
    setEditando(emp);
    setFormulario({
      nombres: emp.nombres, apellidos: emp.apellidos,
      fechaNacimiento: emp.fechaNacimiento?.split('T')[0] || '',
      direccion: emp.direccion || '', telefono: emp.telefono || '',
      correo: emp.correo || '', numeroDpi: emp.numeroDpi,
      salarioBase: emp.salarioBase, cargo: emp.cargo,
      departamentoId: emp.departamentoId, estadoLaboral: emp.estadoLaboral,
    });
    setDialogoAbierto(true);
  };

  const guardar = async () => {
    try {
      setError('');
      const datos = { ...formulario, salarioBase: Number(formulario.salarioBase) };
      if (editando) {
        await cliente.put(`/empleados/${editando.id}`, datos);
      } else {
        await cliente.post('/empleados', datos);
      }
      setDialogoAbierto(false);
      cargarDatos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este empleado?')) return;
    try {
      await cliente.delete(`/empleados/${id}`);
      cargarDatos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const abrirCambiarEstado = (emp: Empleado) => {
    setEmpleadoEstado(emp);
    setNuevoEstado(emp.estadoLaboral);
    setDialogoEstado(true);
  };

  const cambiarEstado = async () => {
    if (!empleadoEstado) return;
    try {
      await cliente.patch(`/empleados/${empleadoEstado.id}/estado`, { estadoLaboral: nuevoEstado });
      setDialogoEstado(false);
      cargarDatos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const colorEstado = (estado: string) => {
    if (estado === 'ACTIVO') return 'success';
    if (estado === 'SUSPENDIDO') return 'warning';
    return 'error';
  };

  if (cargando) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Gestión de Empleados</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear}>Nuevo Empleado</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#2E5090' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>DPI</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cargo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Departamento</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Salario</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {empleados.map((emp) => (
              <TableRow key={emp.id} hover>
                <TableCell>{emp.id}</TableCell>
                <TableCell>{emp.nombres} {emp.apellidos}</TableCell>
                <TableCell>{emp.numeroDpi}</TableCell>
                <TableCell>{emp.cargo}</TableCell>
                <TableCell>{emp.departamento?.nombre || '-'}</TableCell>
                <TableCell>Q{Number(emp.salarioBase).toFixed(2)}</TableCell>
                <TableCell><Chip label={emp.estadoLaboral} color={colorEstado(emp.estadoLaboral)} size="small" /></TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => abrirEditar(emp)} size="small"><Edit /></IconButton>
                  <IconButton color="error" onClick={() => eliminar(emp.id)} size="small"><Delete /></IconButton>
                  <IconButton color="warning" onClick={() => abrirCambiarEstado(emp)} size="small"><SwapHoriz /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogoAbierto} onClose={() => setDialogoAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Nombres" value={formulario.nombres} onChange={(e) => setFormulario({ ...formulario, nombres: e.target.value })} fullWidth />
            <TextField label="Apellidos" value={formulario.apellidos} onChange={(e) => setFormulario({ ...formulario, apellidos: e.target.value })} fullWidth />
            <TextField label="Fecha de Nacimiento" type="date" value={formulario.fechaNacimiento} onChange={(e) => setFormulario({ ...formulario, fechaNacimiento: e.target.value })} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Dirección" value={formulario.direccion} onChange={(e) => setFormulario({ ...formulario, direccion: e.target.value })} fullWidth />
            <TextField label="Teléfono" value={formulario.telefono} onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })} fullWidth />
            <TextField label="Correo" type="email" value={formulario.correo} onChange={(e) => setFormulario({ ...formulario, correo: e.target.value })} fullWidth />
            <TextField label="Número de DPI (13 dígitos)" value={formulario.numeroDpi} onChange={(e) => setFormulario({ ...formulario, numeroDpi: e.target.value })} fullWidth />
            <TextField label="Salario Base" type="number" value={formulario.salarioBase} onChange={(e) => setFormulario({ ...formulario, salarioBase: Number(e.target.value) })} fullWidth />
            <TextField label="Cargo" value={formulario.cargo} onChange={(e) => setFormulario({ ...formulario, cargo: e.target.value })} fullWidth />
            <TextField select label="Departamento" value={formulario.departamentoId} onChange={(e) => setFormulario({ ...formulario, departamentoId: Number(e.target.value) })} fullWidth>
              {departamentos.map((d) => (<MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoAbierto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardar}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogoEstado} onClose={() => setDialogoEstado(false)}>
        <DialogTitle>Cambiar Estado Laboral</DialogTitle>
        <DialogContent>
          <TextField select label="Nuevo Estado" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)} fullWidth sx={{ mt: 1 }}>
            <MenuItem value="ACTIVO">ACTIVO</MenuItem>
            <MenuItem value="SUSPENDIDO">SUSPENDIDO</MenuItem>
            <MenuItem value="RETIRADO">RETIRADO</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoEstado(false)}>Cancelar</Button>
          <Button variant="contained" onClick={cambiarEstado}>Cambiar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}