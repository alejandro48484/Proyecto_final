import { useAuth } from '../context/AuthContext';

export function useRol() {
  const { usuario } = useAuth();
  const rol = usuario?.rol || '';

  return {
    esAdmin: rol === 'ADMINISTRADOR',
    esGestor: rol === 'GESTOR_RRHH',
    esEmpleado: rol === 'EMPLEADO',
    esAdminOGestor: rol === 'ADMINISTRADOR' || rol === 'GESTOR_RRHH',
    rol,
  };
}