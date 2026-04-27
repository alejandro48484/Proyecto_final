import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Divider,
  Avatar, Menu, MenuItem, Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  FolderOpen as FolderIcon,
  AttachMoney as MoneyIcon,
  Assessment as ReportIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';

const ANCHO_MENU = 260;

const menuItems = [
  { texto: 'Dashboard', icono: <DashboardIcon />, ruta: '/dashboard' },
  { texto: 'Empleados', icono: <PeopleIcon />, ruta: '/empleados' },
  { texto: 'Académico', icono: <SchoolIcon />, ruta: '/academico' },
  { texto: 'Expediente', icono: <FolderIcon />, ruta: '/expediente' },
  { texto: 'Nómina', icono: <MoneyIcon />, ruta: '/nomina' },
  { texto: 'Reportes', icono: <ReportIcon />, ruta: '/reportes' },
  { texto: 'Departamentos', icono: <BusinessIcon />, ruta: '/departamentos' },
];

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuUsuario = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCerrarMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCerrarMenu();
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#2E5090',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMenuAbierto(!menuAbierto)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Sistema RRHH y Nómina
          </Typography>

          {usuario && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={usuario.rol}
                size="small"
                sx={{ color: 'white', borderColor: 'white' }}
                variant="outlined"
              />
              <IconButton color="inherit" onClick={handleMenuUsuario}>
                <AccountIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCerrarMenu}
              >
                <MenuItem disabled>
                  <Typography variant="body2">{usuario.correo}</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={menuAbierto}
        sx={{
          width: menuAbierto ? ANCHO_MENU : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: ANCHO_MENU,
            boxSizing: 'border-box',
            backgroundColor: '#1a1a2e',
            color: 'white',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Avatar sx={{ width: 56, height: 56, mx: 'auto', mb: 1, bgcolor: '#ED7D31' }}>
            {usuario?.correo?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="body2" sx={{ color: '#ccc' }}>
            {usuario?.correo}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: '#333' }} />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.ruta} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.ruta)}
                selected={location.pathname === item.ruta}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#2E5090',
                    '&:hover': { backgroundColor: '#3a62a8' },
                  },
                  '&:hover': { backgroundColor: '#16213e' },
                  color: 'white',
                  mx: 1,
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.ruta ? '#ED7D31' : '#888', minWidth: 40 }}>
                  {item.icono}
                </ListItemIcon>
                <ListItemText primary={item.texto} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          transition: 'margin-left 0.3s',
          marginLeft: menuAbierto ? 0 : `-${ANCHO_MENU}px`,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}