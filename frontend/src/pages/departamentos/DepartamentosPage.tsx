import { useState, useEffect } from 'react';
import cliente from '../../api/cliente';
import type { Departamento } from '../../types';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CircularProgress, Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [editando, setEditando] = useState<Departamento | null>(null);
  const [formulario, setFormulario] = useState({ nombre: '', descripcion: '' });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const res = await cliente.get('/departamentos');
      setDepartamentos(res.data);
    } catch {
      setError('Error al cargar departamentos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setFormulario({ nombre: '', descripcion: '' });
    setDialogoAbierto(true);
  };

  const abrirEditar = (dep: Departamento) => {
    setEditando(dep);
    setFormulario({ nombre: dep.nombre, descripcion: dep.descripcion || '' });
    setDialogoAbierto(true);
  };

  const guardar = async () => {
    try {
      setError('');
      if (editando) {
        await cliente.put(`/departamentos/${editando.id}`, formulario);
      } else {
        await cliente.post('/departamentos', formulario);
      }
      setDialogoAbierto(false);
      cargarDatos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este departamento?')) return;
    try {
      await cliente.delete(`/departamentos/${id}`);
      cargarDatos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  if (cargando) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Gestión de Departamentos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear}>Nuevo Departamento</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#2E5090' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleados</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departamentos.map((dep: any) => (
              <TableRow key={dep.id} hover>
                <TableCell>{dep.id}</TableCell>
                <TableCell>{dep.nombre}</TableCell>
                <TableCell>{dep.descripcion || '-'}</TableCell>
                <TableCell><Chip label={dep.empleados?.length || 0} color="primary" size="small" /></TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => abrirEditar(dep)} size="small"><Edit /></IconButton>
                  <IconButton color="error" onClick={() => eliminar(dep.id)} size="small"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogoAbierto} onClose={() => setDialogoAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar Departamento' : 'Nuevo Departamento'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Nombre" value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} fullWidth />
            <TextField label="Descripción" value={formulario.descripcion} onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })} fullWidth multiline rows={3} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoAbierto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardar}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}