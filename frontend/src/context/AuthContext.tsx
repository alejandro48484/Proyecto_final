import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Usuario, LoginResponse } from '../types';
import cliente from '../api/cliente';

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (token) {
      cliente.get('/auth/perfil')
        .then((res) => setUsuario(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setUsuario(null);
        })
        .finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, [token]);

  const login = async (correo: string, contrasena: string) => {
    const res = await cliente.post<LoginResponse>('/auth/login', { correo, contrasena });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUsuario(res.data.usuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}