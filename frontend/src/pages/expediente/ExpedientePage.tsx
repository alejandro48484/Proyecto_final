import { useState, useEffect } from 'react';
import cliente from '../../api/cliente';
import type { Empleado } from '../../types';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, MenuItem, TextField, Alert, CircularProgress,
  Chip, Card, CardContent, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton
} from '@mui/material';
import { CloudUpload, Delete, CheckCircle, Warning, Error as ErrorIcon, Search } from '@mui/icons-material';

const TIPOS_DOCUMENTO = [
  'CONTRATO', 'CERTIFICADO_ESTUDIO', 'DPI',
  'ANTECEDENTES_PENALES', 'ANTECEDENTES_POLICIALES',
  'CONSTANCIA', 'CARTA_RECOMENDACION',
];

export default function ExpedientePage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<number>(0);
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [validacion, setValidacion] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [dialogoSubir, setDialogoSubir] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState('CONTRATO');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const cargarEmpleados = async () => {
    try {
      setCargando(true);
      const res = await cliente.get('/empleados');
      setEmpleados(res.data);
    } catch {
      setError('Error al cargar empleados');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarEmpleados(); }, []);

  const cargarExpediente = async (empleadoId: number) => {
    try {
      setError('');
      const [docsRes, valRes] = await Promise.all([
        cliente.get(`/expediente/empleado/${empleadoId}`),
        cliente.get(`/expediente/validar/${empleadoId}`),
      ]);
      setDocumentos(docsRes.data);
      setValidacion(valRes.data);
    } catch {
      setError('Error al cargar expediente');
    }
  };

  const seleccionarEmpleado = (id: number) => {
    setEmpleadoSeleccionado(id);
    if (id > 0) cargarExpediente(id);
  };

  const subirDocumento = async () => {
    if (!archivo || !empleadoSeleccionado) return;
    try {
      setSubiendo(true);
      setError('');
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('empleadoId', empleadoSeleccionado.toString());
      formData.append('tipoDocumento', tipoDocumento);
      await cliente.post('/expediente/subir', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExito('Documento subido exitosamente');
      setDialogoSubir(false);
      setArchivo(null);
      cargarExpediente(empleadoSeleccionado);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir documento');
    } finally {
      setSubiendo(false);
    }
  };

  const eliminarDocumento = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este documento?')) return;
    try {
      await cliente.delete(`/expediente/${id}`);
      setExito('Documento eliminado');
      cargarExpediente(empleadoSeleccionado);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const colorEstado = (estado: string) => {
    if (estado === 'COMPLETO') return 'success';
    if (estado === 'EN_PROCESO') return 'warning';
    return 'error';
  };

  const iconoEstado = (estado: string) => {
    if (estado === 'COMPLETO') return <CheckCircle color="success" />;
    if (estado === 'EN_PROCESO') return <Warning color="warning" />;
    return <ErrorIcon color="error" />;
  };

  const porcentaje = validacion
    ? Math.round((validacion.totalCompletados / validacion.totalRequeridos) * 100)
    : 0;

  if (cargando) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>Expediente del Empleado</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {exito && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setExito('')}>{exito}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          select label="Seleccionar Empleado" value={empleadoSeleccionado}
          onChange={(e) => seleccionarEmpleado(Number(e.target.value))}
          fullWidth
        >
          <MenuItem value={0}>-- Seleccione un empleado --</MenuItem>
          {empleados.map((emp) => (
            <MenuItem key={emp.id} value={emp.id}>{emp.nombres} {emp.apellidos} - {emp.numeroDpi}</MenuItem>
          ))}
        </TextField>
      </Paper>

      {empleadoSeleccionado > 0 && validacion && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {iconoEstado(validacion.estado)}
                  <Typography variant="h6">Estado del Expediente:</Typography>
                  <Chip label={validacion.estado} color={colorEstado(validacion.estado)} />
                </Box>
                <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setDialogoSubir(true)}>
                  Subir Documento
                </Button>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {validacion.totalCompletados} de {validacion.totalRequeridos} documentos obligatorios ({porcentaje}%)
                </Typography>
                <LinearProgress variant="determinate" value={porcentaje} sx={{ mt: 1, height: 10, borderRadius: 5 }}
                  color={validacion.estado === 'COMPLETO' ? 'success' : validacion.estado === 'EN_PROCESO' ? 'warning' : 'error'} />
              </Box>
              {validacion.documentosFaltantes.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>Documentos faltantes:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {validacion.documentosFaltantes.map((doc: string) => (
                      <Chip key={doc} label={doc.replace(/_/g, ' ')} color="error" size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#2E5090' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Archivo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Carga</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No hay documentos cargados</TableCell>
                  </TableRow>
                ) : (
                  documentos.map((doc: any) => (
                    <TableRow key={doc.id} hover>
                      <TableCell>{doc.id}</TableCell>
                      <TableCell><Chip label={doc.tipoDocumento.replace(/_/g, ' ')} size="small" /></TableCell>
                      <TableCell>{doc.nombreOriginal}</TableCell>
                      <TableCell>{new Date(doc.fechaCarga).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => eliminarDocumento(doc.id)} size="small"><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={dialogoSubir} onClose={() => setDialogoSubir(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Documento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Tipo de Documento" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} fullWidth>
              {TIPOS_DOCUMENTO.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>{tipo.replace(/_/g, ' ')}</MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
              {archivo ? archivo.name : 'Seleccionar Archivo'}
              <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
            </Button>
            {archivo && (
              <Typography variant="body2" color="text.secondary">
                Archivo: {archivo.name} ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoSubir(false)}>Cancelar</Button>
          <Button variant="contained" onClick={subirDocumento} disabled={!archivo || subiendo}>
            {subiendo ? <CircularProgress size={24} /> : 'Subir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}