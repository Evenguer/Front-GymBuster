import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';
import { listEmployees, listClients } from '../../../shared/services/authAPI';

// Función de utilidad para verificar roles
const checkRole = (requiredRoles) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    throw new Error('No hay usuario autenticado');
  }
  
  const userRole = user.role;
  if (!requiredRoles.includes(userRole)) {
    throw new Error('No tienes permisos para realizar esta acción');
  }
};

// Función auxiliar para obtener el token
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No hay token disponible');
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const alquilerAPI = {
  listarAlquileres: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const config = getAuthConfig();
      const response = await axios.get(ENDPOINTS.ALQUILER.LISTAR, config);
      console.log('Respuesta del servidor (alquileres):', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al listar alquileres:', error);
      throw error;
    }
  },

  // Servicios para obtener empleados y clientes
  obtenerEmpleados: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token disponible');
      }
      return await listEmployees(token);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      throw error;
    }
  },

  obtenerClientes: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token disponible');
      }
      return await listClients(token);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  guardarAlquiler: async (alquiler) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      console.log('Datos de alquiler a enviar:', alquiler);
      
      const response = await axios.post(
        ENDPOINTS.ALQUILER.GUARDAR,
        alquiler,
        getAuthConfig()
      );
      
      console.log('Respuesta completa del servidor:', response);
      
      let alquilerData = response.data;
      
      if (typeof alquilerData === 'string') {
        const idMatch = alquilerData.match(/"idAlquiler":(\d+)/);
        if (idMatch && idMatch[1]) {
          alquilerData = {
            idAlquiler: parseInt(idMatch[1]),
            estado: true,
            fechaInicio: new Date().toISOString().split('T')[0],
            fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
          };
          console.log('ID de alquiler extraído correctamente:', alquilerData.idAlquiler);
        } else {
          console.error('No se pudo extraer el ID de alquiler de la respuesta');
          throw new Error('No se pudo procesar la respuesta del servidor');
        }
      }

      if (!alquilerData || typeof alquilerData.idAlquiler !== 'number') {
        console.error('Datos de alquiler inválidos:', alquilerData);
        throw new Error('La respuesta del servidor no tiene el formato esperado');
      }

      const alquilerFormateado = {
        idAlquiler: alquilerData.idAlquiler,
        estado: alquilerData.estado || true,
        fechaInicio: alquilerData.fechaInicio || new Date().toISOString().split('T')[0],
        fechaFin: alquilerData.fechaFin || new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
      };
      
      console.log('Alquiler formateado:', alquilerFormateado);
      return alquilerFormateado;
    } catch (error) {
      console.error('Error detallado al guardar el alquiler:', error);
      throw new Error(error.message || 'Error al guardar el alquiler');
    }
  },

  cambiarEstadoAlquiler: async (id, estado) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.put(
        ENDPOINTS.ALQUILER.CAMBIAR_ESTADO(id),
        null,
        {
          ...getAuthConfig(),
          params: { estado }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del alquiler:', error);
      throw error;
    }
  },
  
  finalizarAlquiler: async (id) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.put(
        ENDPOINTS.ALQUILER.FINALIZAR(id),
        null,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al finalizar el alquiler:', error);
      throw error;
    }
  },
  
  cancelarAlquiler: async (id) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.put(
        ENDPOINTS.ALQUILER.CANCELAR(id),
        null,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al cancelar el alquiler:', error);
      throw error;
    }
  },
  
  marcarVencido: async (id) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.put(
        ENDPOINTS.ALQUILER.VENCIDO(id),
        null,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al marcar como vencido el alquiler:', error);
      throw error;
    }
  },

  // Servicios de Detalle de Alquiler
  agregarDetallesAlquiler: async (alquilerId, detalles) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      if (!alquilerId) {
        throw new Error('ID de alquiler no proporcionado');
      }

      if (!Array.isArray(detalles)) {
        throw new Error('Los detalles deben ser un array');
      }

      const requestBody = {
        alquilerId: parseInt(alquilerId),
        detalles: detalles.map(detalle => ({
          piezaId: parseInt(detalle.piezaId),
          cantidad: parseInt(detalle.cantidad)
        }))
      };

      console.log('Enviando detalles al servidor:', requestBody);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token disponible');
      }

      
      const response = await axios.post(
        ENDPOINTS.ALQUILER.DETALLE.AGREGAR_LOTE,
        requestBody,
        getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al agregar detalles de alquiler:', error.response?.data || error);
      if (error.response?.status === 403) {
        throw new Error('No tienes permiso para agregar detalles al alquiler');
      }
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  eliminarDetalleAlquiler: async (detalleId) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const response = await axios.delete(
        ENDPOINTS.ALQUILER.DETALLE.ELIMINAR(detalleId),
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al eliminar detalle de alquiler:', error);
      throw error;
    }
  },

  // Servicios de Pago
  registrarPago: async (alquilerId, montoPagado, metodoPago) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      const response = await axios.post(
        ENDPOINTS.ALQUILER.PAGO.REGISTRAR,
        {
          alquiler: { idAlquiler: alquilerId },
          montoPagado,
          metodoPago
        },
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error;
    }
  },

  listarPiezas: async () => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      console.log('Usando endpoint de piezas:', ENDPOINTS.PIEZA.LISTAR);
      
      const response = await axios.get(
        ENDPOINTS.PIEZA.LISTAR,
        getAuthConfig()
      );
      
      // Asegurar que response.data es un array
      console.log('Respuesta original de piezas:', response.data);
      
      // Si response.data no es un array, intenta convertirlo o devuelve un array vacío
      if (!Array.isArray(response.data)) {
        if (response.data && typeof response.data === 'object') {
          // Si es un objeto, podría ser que la API esté devolviendo un wrapper con la lista dentro
          // Buscar alguna propiedad que pueda contener el array
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            console.log('Se encontró un array dentro del objeto:', possibleArrays[0]);
            return possibleArrays[0];
          }
          
          // Si no hay arrays dentro, pero puede ser iterable, convertimos a array
          console.log('Convirtiendo objeto a array de piezas');
          return Object.values(response.data);
        }
        
        // Si no podemos convertirlo, devolvemos array vacío para evitar errores
        console.error('La respuesta no es un array ni se puede convertir:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al listar piezas:', error);
      // Devolvemos array vacío en caso de error
      return [];
    }
  },

  obtenerAlquilerConDetalle: (idAlquiler) => {
    const alquileres = JSON.parse(localStorage.getItem('alquileres') || '[]');
    const alquiler = alquileres.find(a => a.idAlquiler === idAlquiler);
    if (!alquiler) {
      throw new Error('Alquiler no encontrado');
    }
    return alquiler;
  },

  registrarDevolucion: async (id) => {
    try {
      checkRole(['ADMIN', 'RECEPCIONISTA']);
      
      const response = await axios.put(
        ENDPOINTS.ALQUILER.REGISTRAR_DEVOLUCION(id),
        null,
        getAuthConfig()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al registrar devolución del alquiler:', error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },
};
