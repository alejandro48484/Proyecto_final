import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography
} from '@mui/material';
import { Warning } from '@mui/icons-material';

interface Props {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  colorBoton?: 'error' | 'warning' | 'primary';
  textoBotom?: string;
}

export default function ConfirmDialog({
  abierto, titulo, mensaje, onConfirmar, onCancelar,
  colorBoton = 'error', textoBotom = 'Confirmar'
}: Props) {
  return (
    <Dialog open={abierto} onClose={onCancelar} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color={colorBoton} />
        {titulo}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">{mensaje}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelar}>Cancelar</Button>
        <Button variant="contained" color={colorBoton} onClick={onConfirmar}>
          {textoBotom}
        </Button>
      </DialogActions>
    </Dialog>
  );
}