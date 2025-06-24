import axios from 'axios';
import { ENDPOINTS, BASE_URL } from './endpoints';

// URL base para todas las peticiones
const API_URL = 'http://localhost:8080'; // Definimos la URL base completa sin /api
// BASE_URL contiene '/api' pero necesitamos la base sin /api para algunas llamadas directas

export const login = async (credentials) => {
  try {
    // Usar directamente los campos tal como vienen del formulario
    // Sin cambiar los nombres
    console.log("Intentando login con:", JSON.stringify(credentials));
    
    const response = await axios.post(ENDPOINTS.LOGIN, credentials, {
      headers: {
        'Content-Type': 'application/json'
      }
      // Quita withCredentials si no es necesario
    });
    
    console.log("Respuesta:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error completo:", error);
    if (error.response) {
      console.error("Detalles del error:", error.response.data);
    }
    throw new Error(error.response?.data?.message || 'Error en el servidor');
  }
};

// Función para verificar si un DNI o correo ya existe
export const checkExistingUser = async (dni, correo) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Se requiere autenticación');
    }

    // Verificar DNI
    try {
      const response = await axios.get(`${ENDPOINTS.BASE_URL}/personas/buscar/dni/${dni}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.idPersona) {
        return { exists: true, field: 'dni', message: 'El DNI ya está registrado' };
      }
    } catch (error) {
      // Si retorna 404, significa que no existe, lo cual es bueno
      if (error.response && error.response.status !== 404) {
        console.error('Error al verificar DNI:', error);
      }
    }

    // Verificar correo
    try {
      const response = await axios.get(`${ENDPOINTS.BASE_URL}/personas/buscar/correo/${correo}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.idPersona) {
        return { exists: true, field: 'correo', message: 'El correo ya está registrado' };
      }
    } catch (error) {
      // Si retorna 404, significa que no existe, lo cual es bueno
      if (error.response && error.response.status !== 404) {
        console.error('Error al verificar correo:', error);
      }
    }

    return { exists: false };
  } catch (error) {
    console.error('Error en verificación:', error);
    throw new Error('Error al verificar los datos');
  }
};

export const register = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Se requiere autenticación para registrar usuarios');
    }console.log('Iniciando registro de usuario:', {
      rol: userData.rol,
      nombreUsuario: userData.nombreUsuario
    });

    // Asegurarse de que el token es válido y no está expirado
    if (token === 'null' || token === 'undefined') {
      console.error('Token inválido:', token);
      throw new Error('Sesión inválida. Por favor, vuelve a iniciar sesión');
    }

    console.log('Usando token para registro:', token.substring(0, 20) + '...');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Asegurarse de que los campos requeridos estén presentes
    const requiredFields = ['nombreUsuario', 'contrasena', 'nombre', 'apellidos', 'dni', 'correo', 'rol'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
    }

    // Validaciones específicas por rol
    if (userData.rol === 'ENTRENADOR') {
      if (!userData.especialidadesIds || userData.especialidadesIds.length === 0) {
        throw new Error('Un entrenador debe tener al menos una especialidad');
      }
      if (userData.tipoInstructor === 'PREMIUM' && !userData.cupoMaximo) {
        throw new Error('Los entrenadores premium deben especificar un cupo máximo');
      }
    }

    if (['ENTRENADOR', 'RECEPCIONISTA'].includes(userData.rol)) {
      if (!userData.ruc || !userData.salario || !userData.fechaContratacion) {
        throw new Error('Los empleados deben especificar RUC, salario y fecha de contratación');
      }
    }

    console.log('Enviando datos de registro:', {
      ...userData,
      contrasena: '********' // No logear la contraseña
    });

    const response = await axios.post(ENDPOINTS.REGISTER, userData, { headers });
    console.log('Registro exitoso:', response.data);
    return response.data;  } catch (error) {
    console.error('Error en registro:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
          // Detectar tipos de error específicos
      if (error.response.status === 409 || 
          (error.response.data && error.response.data.message && 
           (error.response.data.message.includes('Duplicate') || 
            error.response.data.message.includes('duplicado') ||
            error.response.data.message.includes('existente')))) {
        throw new Error('Ya existe un usuario con ese DNI o correo electrónico');
      } else if (error.response.status === 403) {
        // Intentar renovar el token y volver a intentar
        console.error('Error 403: Posible token expirado o sin permisos');
        localStorage.removeItem('token'); // Forzar nueva autenticación
        throw new Error('Sesión caducada. Por favor, vuelve a iniciar sesión');
      }
    }
    
    // Si llegamos aquí, es un error genérico o desconocido
    let errorMsg = 'Error al registrar usuario';
    
    // Intentar extraer mensaje más específico
    if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error.message && error.message.includes('Duplicate')) {
      errorMsg = 'Ya existe un usuario con ese DNI o correo electrónico';
    }
    
    throw new Error(errorMsg);
  }
};

export const getUsers = async (token) => {
  try {
    if (!token) {
      throw new Error('Se requiere token para obtener usuarios');
    }

    console.log('Obteniendo lista de usuarios...');
    
    const response = await axios.get(ENDPOINTS.GET_USERS, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Usuarios obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
    throw new Error(error.response?.data?.message || 'Error al obtener la lista de usuarios');
  }
};

// Alias de getUsers para mantener consistencia con otros métodos list*
export const listUsers = getUsers;

export const listClients = async (token) => {
  try {
    const response = await axios.get(ENDPOINTS.LIST_CLIENTS, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error al listar clientes:", error);
    throw new Error(error.response?.data?.message || 'Error al obtener la lista de clientes');
  }
};

export const toggleUserStatus = async (userId, newStatus, token) => {
  try {
    // Asegurarse de que el token esté presente
    if (!token) {
      throw new Error('Token no encontrado');
    }
    
    console.log(`Cambiando estado de usuario ID ${userId} a: ${newStatus ? 'Activo' : 'Inactivo'}`);
    
    // Utilizamos el endpoint correcto para usuarios de autenticación
    const response = await axios.put(
      ENDPOINTS.TOGGLE_USER_STATUS(userId),
      { estado: newStatus },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data) {
      throw new Error('Respuesta vacía del servidor');
    }
    
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    if (error.response) {
      console.error('Detalles del error:', error.response.status, error.response.data);
    }
    throw error;
  }
};

export const toggleClientStatus = async (clientId, newStatus, token) => {
  try {
    // Asegurarse de que el token esté presente
    if (!token) {
      throw new Error('Token no encontrado');
    }
    
    console.log(`Cambiando estado de cliente ID ${clientId} a: ${newStatus ? 'Activo' : 'Inactivo'}`);
    
    // Utilizamos el endpoint específico para clientes
    const response = await axios.put(
      ENDPOINTS.TOGGLE_CLIENT_STATUS(clientId),
      { estado: newStatus },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data) {
      throw new Error('Respuesta vacía del servidor');
    }
    
    console.log('Respuesta del servidor para cliente:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error al cambiar estado del cliente:", error);
    if (error.response) {
      console.error('Detalles del error:', error.response.status, error.response.data);
    }
    throw error;
  }
};

export const updateClient = async (clientId, data, token) => {
  try {
    if (!token) {
      throw new Error('Token no encontrado');
    }
    
    // Comprobación adicional para depurar problemas
    if (!clientId) {
      console.error('ID de cliente no válido:', clientId);
      throw new Error('ID de cliente no válido');
    }
      console.log(`Actualizando cliente ${clientId} con datos:`, JSON.stringify(data, null, 2));
    console.log('Endpoint usado:', ENDPOINTS.UPDATE_CLIENT(clientId));
    
    // Verificar específicamente si hay un cambio en el género
    if (data.genero !== undefined) {
      console.log('Detectado cambio en el campo "genero":', data.genero);
    }
    
    // Asegurarse de que el formato de fecha es el correcto
    if (data.fechaNacimiento === '') {
      data.fechaNacimiento = null;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Headers de la petición:', headers);

    const response = await axios.put(
      ENDPOINTS.UPDATE_CLIENT(clientId),
      data,
      { headers }
    );

    if (!response.data) {
      throw new Error('Respuesta vacía del servidor');
    }

    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    if (error.response) {
      console.error('Detalles de respuesta:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    throw error;
  }
};

export const listEmployees = async (token) => {
  try {
    if (!token) {
      throw new Error('Se requiere token para listar empleados');
    }

    console.log('Obteniendo lista de empleados...');
    
    const response = await axios.get(ENDPOINTS.LIST_EMPLOYEES, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Empleados obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al listar empleados:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
    throw new Error(error.response?.data?.message || 'Error al obtener la lista de empleados');
  }
};

export const getUsersSecurityDetails = async (token) => {
  try {
    if (!token) {
      console.error('Token no proporcionado al obtener detalles de seguridad');
      throw new Error('Se requiere token para obtener detalles de seguridad');
    }
    
    console.log('Obteniendo información de último acceso...');
    
    const response = await axios.get(ENDPOINTS.GET_USERS_SECURITY, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Información de último acceso obtenida:', response.data.length, 'registros');
    return response.data;
  } catch (error) {
    console.error('Error al obtener información de último acceso:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.status, error.response.data);
      
      // Si el error es 403, puede ser un problema de permisos o token expirado
      if (error.response.status === 403) {
        console.error('Error 403: No tienes permisos o el token ha expirado');
        localStorage.removeItem('token'); // Forzar nueva autenticación
        throw new Error('Sesión caducada o sin permisos. Por favor, vuelve a iniciar sesión');
      }
    }
    throw new Error(error.response?.data?.message || 'Error al obtener información de último acceso');
  }
};

export const updateUserCredentials = async (userId, credentials, token) => {
  try {
    // Usar la URL directamente con la ruta correcta
    const response = await fetch(`${API_URL}/api/auth/usuarios/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error actualizando credenciales de usuario:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, roleName, token) => {
  try {
    // Normalizar el rol para asegurar que está en formato correcto (sin prefijo ROLE_)
    let normalizedRole = roleName;
    if (normalizedRole.startsWith('ROLE_')) {
      normalizedRole = normalizedRole.replace('ROLE_', '');
    }
    
    console.log(`Enviando actualización de rol para usuario ${userId}: ${normalizedRole}`);
    
    // Usar la URL directamente con la ruta correcta
    const response = await fetch(`${API_URL}/api/auth/usuarios/${userId}/rol`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rol: normalizedRole })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error actualizando rol de usuario:', error);
    throw error;
  }
};