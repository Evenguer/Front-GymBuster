import axios from 'axios';
import { ENDPOINTS } from './endpoints';

export const listPlanes = async (token) => {
  try {
    const response = await axios.get(ENDPOINTS.LIST_PLANS, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error.response?.data?.message || 'Error al obtener los planes';
  }
};

export const crearPlan = async (planData, token) => {
  try {
    const response = await axios.post(ENDPOINTS.SAVE_PLAN, planData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error.response?.data?.message || 'Error al crear el plan';
  }
};

export const actualizarPlan = async (id, planData, token) => {
  try {
    const response = await axios.put(
      ENDPOINTS.UPDATE_PLAN,
      { ...planData, idPlan: id },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error.response?.data?.message || 'Error al actualizar el plan';
  }
};

export const cambiarEstadoPlan = async (id, estado, token) => {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await axios({
      method: 'PUT',
      url: ENDPOINTS.TOGGLE_PLAN_STATUS(id),
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { estado }
    });

    return response.data;
  } catch (error) {
    console.error('Error detallado:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para cambiar el estado del plan');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    throw error.response?.data?.message || 
          error.message || 
          'Error al cambiar el estado del plan';
  }
};
