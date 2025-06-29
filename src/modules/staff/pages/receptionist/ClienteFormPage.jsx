import React, { useState } from 'react';
import { Card, Title, TextInput, Button } from '@tremor/react';
import { register, checkExistingUser } from '../../../../shared/services/authAPI';
import { toast, Toaster } from 'react-hot-toast';
import './modal-styles.css';

const initialFormData = {
  nombreUsuario: '',
  contrasena: '',
  nombre: '',
  apellidos: '',
  dni: '',
  correo: '',
  celular: '',
  fechaNacimiento: '',
  genero: '',
  direccion: ''
};

const ClienteFormPage = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.nombreUsuario) errors.nombreUsuario = 'El nombre de usuario es requerido';
    if (!formData.contrasena) errors.contrasena = 'La contraseña es requerida';
    if (!formData.nombre) errors.nombre = 'El nombre es requerido';
    if (!formData.apellidos) errors.apellidos = 'Los apellidos son requeridos';
    if (!formData.dni) errors.dni = 'El DNI es requerido';
    if (!formData.correo) errors.correo = 'El correo es requerido';
    if (!formData.genero) errors.genero = 'El género es requerido';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const checkResult = await checkExistingUser(formData.dni, formData.correo);
      if (checkResult.exists) {
        toast.error(checkResult.message, {
          duration: 4000,
          position: 'top-right',
          style: { background: '#EF4444', color: '#fff' },
        });
        setLoading(false);
        return;
      }
      const data = await register({ ...formData, rol: 'CLIENTE' });
      if (!data) throw new Error('Error al crear el cliente');
      setFormData(initialFormData);
      setFormErrors({});
      toast.success('Usuario registrado exitosamente', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
        },
        iconTheme: {
          primary: '#10B981',
          secondary: '#fff',
        },
      });
    } catch (error) {
      console.error('Error:', error);
      if (error.message.includes('Duplicate entry') || error.message.includes('duplicado')) {
        toast.error('Ya existe un cliente con ese DNI o correo electrónico', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      } else if (error.message.includes('permisos')) {
        toast.error('No tienes permisos para crear clientes', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      } else {
        toast.error(error.message || 'Error al crear el cliente', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex justify-between items-center">
        <div>
          <Title className="mb-1">Registrar Nuevo Cliente</Title>
          <p className="text-gray-500">Formulario para registrar un nuevo cliente</p>
        </div>
      </div>
      <Card className="w-full p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
              <TextInput
                name="nombreUsuario"
                value={formData.nombreUsuario}
                onChange={handleInputChange}
                error={formErrors.nombreUsuario}
                placeholder="Ingrese nombre de usuario"
              />
              {formErrors.nombreUsuario && (
                <p className="text-red-500 text-xs mt-1">{formErrors.nombreUsuario}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <TextInput
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleInputChange}
                error={formErrors.contrasena}
                placeholder="Ingrese contraseña"
              />
              {formErrors.contrasena && (
                <p className="text-red-500 text-xs mt-1">{formErrors.contrasena}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <TextInput
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                error={formErrors.nombre}
                placeholder="Ingrese nombre"
              />
              {formErrors.nombre && (
                <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellidos</label>
              <TextInput
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                error={formErrors.apellidos}
                placeholder="Ingrese apellidos"
              />
              {formErrors.apellidos && (
                <p className="text-red-500 text-xs mt-1">{formErrors.apellidos}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">DNI</label>
              <TextInput
                name="dni"
                value={formData.dni}
                onChange={handleInputChange}
                error={formErrors.dni}
                placeholder="Ingrese DNI"
              />
              {formErrors.dni && (
                <p className="text-red-500 text-xs mt-1">{formErrors.dni}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo</label>
              <TextInput
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                error={formErrors.correo}
                placeholder="Ingrese correo electrónico"
              />
              {formErrors.correo && (
                <p className="text-red-500 text-xs mt-1">{formErrors.correo}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Celular</label>
              <TextInput
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                placeholder="Ingrese número de celular"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
              <TextInput
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Género</label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleInputChange}
                className="custom-select w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seleccione género</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
              {formErrors.genero && (
                <p className="text-red-500 text-xs mt-1">{formErrors.genero}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <TextInput
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Ingrese dirección"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button type="submit" variant="primary" loading={loading} disabled={loading}>
              {loading ? 'Creando...' : 'Registrar Cliente'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ClienteFormPage;
