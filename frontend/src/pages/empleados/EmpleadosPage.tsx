/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import cliente from '../../api/cliente';
import type { Empleado, Departamento } from '../../types';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete, SwapHoriz } from '@mui/icons-material';
import { useRol } from '../../hooks/useRol';

export default function EmpleadosPage() {
  const { esAdmin, esAdminOGestor } = useRol();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [errores, setErrores] = useState<any>({});
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
    setErrores({});
    setFormulario({
      nombres: '', apellidos: '', fechaNacimiento: '', direccion: '',
      telefono: '', correo: '', numeroDpi: '', salarioBase: 0,
      cargo: '', departamentoId: departamentos[0]?.id || 0, estadoLaboral: 'ACTIVO',
    });
    setDialogoAbierto(true);
  };

  const abrirEditar = (emp: Empleado) => {
    setEditando(emp);
    setErrores({});
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

  const validarFormulario = () => {
    const nuevosErrores: any = {};

    if (!formulario.nombres || formulario.nombres.trim().length < 2)
      nuevosErrores.nombres = 'El nombre debe tener al menos 2 caracteres';

    if (!formulario.apellidos || formulario.apellidos.trim().length < 2)
      nuevosErrores.apellidos = 'Los apellidos deben tener al menos 2 caracteres';

    if (!formulario.numeroDpi || !/^\d{13}$/.test(formulario.numeroDpi))
      nuevosErrores.numeroDpi = 'El DPI debe tener exactamente 13 dígitos numéricos';

    if (!formulario.correo)
      nuevosErrores.correo = 'El correo electrónico es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.correo))
       nuevosErrores.correo = 'El correo no tiene un formato válido';

    if (!formulario.telefono || formulario.telefono.trim().length < 8)
  nuevosErrores.telefono = 'El teléfono es requerido (mínimo 8 dígitos)';

    if (!formulario.direccion || formulario.direccion.trim().length < 5)
  nuevosErrores.direccion = 'La dirección es requerida (mínimo 5 caracteres)';

    if (!formulario.salarioBase || Number(formulario.salarioBase) <= 0)
      nuevosErrores.salarioBase = 'El salario debe ser mayor a 0';

    if (!formulario.cargo || formulario.cargo.trim().length < 2)
      nuevosErrores.cargo = 'El cargo debe tener al menos 2 caracteres';

    if (!formulario.departamentoId || formulario.departamentoId === 0)
      nuevosErrores.departamentoId = 'Debe seleccionar un departamento';

    if (!formulario.fechaNacimiento)
      nuevosErrores.fechaNacimiento = 'La fecha de nacimiento es requerida';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardar = async () => {
    if (!validarFormulario()) return;
    try {
      setError('');
      const datos = { ...formulario, salarioBase: Number(formulario.salarioBase) };
      if (editando) {
        await cliente.put(`/empleados/${editando.id}`, datos);
      } else {
        await cliente.post('/empleados', datos);
      }
      setDialogoAbierto(false);
      setErrores({});
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
        {esAdminOGestor && <Button variant="contained" startIcon={<Add />} onClick={abrirCrear}>Nuevo Empleado</Button>}
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
                <TableCell><Chip label={emp.estadoLaboral} color={colorEstado(emp.estadoLaboral) as any} size="small" /></TableCell>
                <TableCell>
                  {esAdminOGestor && <IconButton color="primary" onClick={() => abrirEditar(emp)} size="small"><Edit /></IconButton>}
                  {esAdmin && <IconButton color="error" onClick={() => eliminar(emp.id)} size="small"><Delete /></IconButton>}
                  {esAdminOGestor && <IconButton color="warning" onClick={() => abrirCambiarEstado(emp)} size="small"><SwapHoriz /></IconButton>}
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
            <TextField label="Nombres" value={formulario.nombres}
              onChange={(e) => setFormulario({ ...formulario, nombres: e.target.value })}
              fullWidth error={!!errores.nombres} helperText={errores.nombres} />

            <TextField label="Apellidos" value={formulario.apellidos}
              onChange={(e) => setFormulario({ ...formulario, apellidos: e.target.value })}
              fullWidth error={!!errores.apellidos} helperText={errores.apellidos} />

            <TextField label="Fecha de Nacimiento" type="date" value={formulario.fechaNacimiento}
              onChange={(e) => setFormulario({ ...formulario, fechaNacimiento: e.target.value })}
              fullWidth slotProps={{ inputLabel: { shrink: true } }}
              error={!!errores.fechaNacimiento} helperText={errores.fechaNacimiento} />

            <TextField label="Dirección" value={formulario.direccion}
              onChange={(e) => setFormulario({ ...formulario, direccion: e.target.value })}
              fullWidth error={!!errores.direccion} helperText={errores.direccion} />

            <TextField label="Teléfono" value={formulario.telefono}
              onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
              fullWidth error={!!errores.telefono} helperText={errores.telefono} />

            <TextField label="Correo electrónico" type="email" value={formulario.correo}
              onChange={(e) => setFormulario({ ...formulario, correo: e.target.value })}
              fullWidth error={!!errores.correo} helperText={errores.correo} />

            <TextField label="Número de DPI (13 dígitos)" value={formulario.numeroDpi}
              onChange={(e) => setFormulario({ ...formulario, numeroDpi: e.target.value })}
              fullWidth slotProps={{ htmlInput: { maxLength: 13 } }}
              error={!!errores.numeroDpi} helperText={errores.numeroDpi} />

            <TextField label="Salario Base (Q)" type="number" value={formulario.salarioBase}
              onChange={(e) => setFormulario({ ...formulario, salarioBase: Number(e.target.value) })}
              fullWidth slotProps={{ htmlInput: { min: 0 } }}
              error={!!errores.salarioBase} helperText={errores.salarioBase} />

            <TextField label="Cargo" value={formulario.cargo}
              onChange={(e) => setFormulario({ ...formulario, cargo: e.target.value })}
              fullWidth error={!!errores.cargo} helperText={errores.cargo} />

            <TextField select label="Departamento" value={formulario.departamentoId}
              onChange={(e) => setFormulario({ ...formulario, departamentoId: Number(e.target.value) })}
              fullWidth error={!!errores.departamentoId} helperText={errores.departamentoId}>
              {departamentos.map((d) => (<MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogoAbierto(false); setErrores({}); }}>Cancelar</Button>
          <Button variant="contained" onClick={guardar}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogoEstado} onClose={() => setDialogoEstado(false)}>
        <DialogTitle>Cambiar Estado Laboral</DialogTitle>
        <DialogContent>
          <TextField select label="Nuevo Estado" value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)} fullWidth sx={{ mt: 1 }}>
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