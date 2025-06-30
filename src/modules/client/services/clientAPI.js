import axios from 'axios';
import { ENDPOINTS } from '../../../shared/services/endpoints';

export const getClientProfile = async (token) => {
  if (!token) throw new Error('No hay token de autenticación');
  try {
    const response = await axios.get(ENDPOINTS.CLIENT_PROFILE, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al obtener el perfil';
  }
};

export const updateClientPassword = async (data, token) => {
  if (!token) throw new Error('No hay token de autenticación');
  try {
    const response = await axios.post(ENDPOINTS.CLIENT_CHANGE_PASSWORD, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error al cambiar la contraseña';
  }
};