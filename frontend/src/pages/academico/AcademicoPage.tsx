import { useState, useEffect } from 'react';
import cliente from '../../api/cliente';
import type { Empleado } from '../../types';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import { Add, Edit, Delete, ExpandMore, School } from '@mui/icons-material';

interface InfoAcademica {
  id: number;
  empleadoId: number;
  tituloAcademico: string;
  certificacion: string | null;
  institucionEducativa: string;
  fechaGraduacion: string | null;
}

export default function AcademicoPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [editando, setEditando] = useState<InfoAcademica | null>(null);
  const [formulario, setFormulario] = useState({
    empleadoId: 0, tituloAcademico: '', certificacion: '',
    institucionEducativa: '', fechaGraduacion: '',
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [empRes, acadRes] = await Promise.all([
        cliente.get('/empleados'),
        cliente.get('/academico'),
      ]);
      setEmpleados(empRes.data);
      setRegistros(acadRes.data);
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
      empleadoId: empleados[0]?.id || 0, tituloAcademico: '', certificacion: '',
      institucionEducativa: '', fechaGraduacion: '',
    });
    setDialogoAbierto(true);
  };

  const abrirEditar = (reg: InfoAcademica) => {
    setEditando(reg);
    setFormulario({
      empleadoId: reg.empleadoId, tituloAcademico: reg.tituloAcademico,
      certificacion: reg.certificacion || '',
      institucionEducativa: reg.institucionEducativa,
      fechaGraduacion: reg.fechaGraduacion?.split('T')[0] || '',
    });
    setDialogoAbierto(true);
  };

  const guardar = async () => {
    try {
      setError('');
      const datos = {
        ...formulario,
        fechaGraduacion: formulario.fechaGraduacion || null,
        certificacion: formulario.certificacion || null,
      };
      if (editando) {
        await cliente.put(`/academico/${editando.id}`, datos);
      } else {
        await cliente.post('/academico', datos);
      }
      setDialogoAbierto(false);
      cargarDatos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este registro académico?')) return;
    try {
      await cliente.delete(`/academico/${id}`);
      cargarDatos();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const registrosPorEmpleado = empleados.map((emp) => ({
    ...emp,
    academicos: registros.filter((r: any) => r.empleadoId === emp.id),
  })).filter((emp) => emp.academicos.length > 0);

  if (cargando) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Información Académica</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear}>Nuevo Registro</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {registrosPorEmpleado.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <School sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
          <Typography color="text.secondary">No hay registros académicos. Agregá uno con el botón de arriba.</Typography>
        </Paper>
      ) : (
        registrosPorEmpleado.map((emp) => (
          <Accordion key={emp.id} defaultExpanded sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}>{emp.nombres} {emp.apellidos}</Typography>
                <Chip label={`${emp.academicos.length} título(s)`} size="small" color="primary" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Título</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Certificación</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Institución</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Graduación</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emp.academicos.map((reg: any) => (
                      <TableRow key={reg.id} hover>
                        <TableCell>{reg.tituloAcademico}</TableCell>
                        <TableCell>{reg.certificacion || '-'}</TableCell>
                        <TableCell>{reg.institucionEducativa}</TableCell>
                        <TableCell>{reg.fechaGraduacion ? new Date(reg.fechaGraduacion).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => abrirEditar(reg)} size="small"><Edit /></IconButton>
                          <IconButton color="error" onClick={() => eliminar(reg.id)} size="small"><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))
      )}

      <Dialog open={dialogoAbierto} onClose={() => setDialogoAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar Registro Académico' : 'Nuevo Registro Académico'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Empleado" value={formulario.empleadoId} onChange={(e) => setFormulario({ ...formulario, empleadoId: Number(e.target.value) })} fullWidth>
              {empleados.map((emp) => (<MenuItem key={emp.id} value={emp.id}>{emp.nombres} {emp.apellidos}</MenuItem>))}
            </TextField>
            <TextField label="Título Académico" value={formulario.tituloAcademico} onChange={(e) => setFormulario({ ...formulario, tituloAcademico: e.target.value })} fullWidth />
            <TextField label="Certificación (opcional)" value={formulario.certificacion} onChange={(e) => setFormulario({ ...formulario, certificacion: e.target.value })} fullWidth />
            <TextField label="Institución Educativa" value={formulario.institucionEducativa} onChange={(e) => setFormulario({ ...formulario, institucionEducativa: e.target.value })} fullWidth />
            <TextField label="Fecha de Graduación" type="date" value={formulario.fechaGraduacion} onChange={(e) => setFormulario({ ...formulario, fechaGraduacion: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
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