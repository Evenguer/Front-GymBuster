import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// URL base de la API
const API_URL = 'http://localhost:8080/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configurar interceptor para incluir el token en todas las solicitudes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Opcional: interceptor para manejar errores de autorización globalmente
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    
    return () => axios.interceptors.response.eject(interceptor);
  }, [token]);

  useEffect(() => {
    // Verificar si hay token al cargar la aplicación
    const checkAuth = async () => {
      if (token) {
        try {
          // Si tenemos información del usuario en localStorage, la usamos
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              setIsAuthenticated(true);
            } catch (e) {
              console.error('Error al parsear la información del usuario almacenada', e);
            }
          } else {
            // Si no hay información almacenada, asumimos que el token es válido
            // y permitimos que el usuario navegue (el interceptor manejará la invalidez del token)
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Error al verificar la autenticación', err);
          logout();
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      setError(null);
      
      // Realizar petición al backend real
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      // Imprimir la respuesta completa para depuración
      console.log('Respuesta de login:', response.data);
      
      // Verificar la estructura de la respuesta
      if (!response.data) {
        throw new Error('Respuesta del servidor vacía');
      }      // La respuesta debería ser un objeto JwtResponse según tu backend
      // {id: number, token: string, tipo: string, nombreUsuario: string, roles: string[]}
      const { id, token, nombreUsuario, roles } = response.data;
      
      if (!token) {
        throw new Error('No se recibió el token de autenticación');
      }
      
      // Guardar token en localStorage
      localStorage.setItem('token', token);
      setToken(token);
        // Crear objeto de usuario a partir de los datos obtenidos
      const userFromResponse = {
        id: id || 0, // Ahora obtenemos el ID desde la respuesta
        username: nombreUsuario,
        roles: roles || [], // Guardar el array de roles completo
        role: obtenerRolPrincipal(roles || []), // Para compatibilidad con código existente
        name: nombreUsuario,
        token: token // Guardar el token para usar en las llamadas a API
      };
      
      console.log('Usuario procesado:', userFromResponse);
      console.log('Roles recibidos:', roles);
      
      // Guardar información básica del usuario en localStorage
      localStorage.setItem('user', JSON.stringify(userFromResponse));
      
      setUser(userFromResponse);
      setIsAuthenticated(true);
      
      // Configurar token en cabeceras por defecto
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return userFromResponse;
    } catch (err) {
      // Capturar específicamente el mensaje de error del servidor si existe
      let mensaje;
      
      console.error('Error completo:', err);
      
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          mensaje = err.response.data;
        } else {
          mensaje = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        mensaje = err.message;
      } else {
        mensaje = 'Error al iniciar sesión';
      }
      
      setError(mensaje);
      throw new Error(mensaje);
    }
  };
  // Función auxiliar para obtener el rol principal del usuario
  const obtenerRolPrincipal = (roles) => {
    console.log('Obteniendo rol principal de:', roles);
    
    if (!Array.isArray(roles)) {
      if (typeof roles === 'string') {
        // Si es string, lo convertimos a array
        roles = [roles];
      } else {
        console.warn('Roles no es un array ni string:', roles);
        return 'CLIENTE'; // Valor por defecto si roles no es array ni string
      }
    }
    
    // Normalizar roles (pueden venir en diferentes formatos)
    const rolesNormalizados = roles.map(rol => {
      if (typeof rol === 'string') {
        return rol.toUpperCase(); // No quitamos el prefijo ROLE_ para mantener consistencia
      } else if (rol && rol.authority) {
        return rol.authority.toUpperCase();
      } else if (rol && rol.nombre) {
        return rol.nombre.toUpperCase();
      }
      return '';
    });
    
    console.log('Roles normalizados:', rolesNormalizados);
    
    // Buscar roles en orden de prioridad, ahora considerando el prefijo ROLE_
    if (rolesNormalizados.some(r => r.includes('ADMIN') || r === 'ROLE_ADMIN')) return 'ADMIN';
    if (rolesNormalizados.some(r => r.includes('RECEP') || r === 'ROLE_RECEPCIONISTA')) return 'RECEPCIONISTA';
    if (rolesNormalizados.some(r => r.includes('ENTRENADOR') || r.includes('TRAINER') || r === 'ROLE_ENTRENADOR')) return 'ENTRENADOR';
    return 'CLIENTE';
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading, 
        error, 
        login, 
        logout, 
        clearError 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};