import React, { useState, useEffect } from 'react';
import { Card, Title, TextInput, Button } from '@tremor/react';
import { EnhancedSelect as Select, EnhancedMultiSelect as MultiSelect, SelectItem, MultiSelectItem } from './SelectWrapper';
import { register, checkExistingUser } from '../../../../shared/services/authAPI';
import { toast } from 'react-hot-toast';
import { listEspecialidades } from '../../../../shared/services/especialidadAPI';
import './modal-styles.css'; // Importamos los estilos personalizados

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [especialidades, setEspecialidades] = useState([]);
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
    rol: '',
    direccion: '',
    ruc: '',
    salario: '',
    fechaContratacion: '',
    tipoInstructor: '',
    cupoMaximo: '',
    especialidadesIds: []
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const cargarEspecialidades = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await listEspecialidades(token);
        setEspecialidades(data);
      } catch (error) {
        console.error('Error al cargar especialidades:', error);
      }
    };
    cargarEspecialidades();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleEspecialidadesChange = (values) => {
    setFormData(prevData => ({
      ...prevData,
      especialidadesIds: values
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    // Validaciones básicas para todos los usuarios
    if (!formData.nombreUsuario) errors.nombreUsuario = 'El nombre de usuario es requerido';
    if (!formData.contrasena) errors.contrasena = 'La contraseña es requerida';
    if (!formData.nombre) errors.nombre = 'El nombre es requerido';
    if (!formData.apellidos) errors.apellidos = 'Los apellidos son requeridos';
    if (!formData.dni) errors.dni = 'El DNI es requerido';
    if (!formData.correo) errors.correo = 'El correo es requerido';
    if (!formData.rol) errors.rol = 'El rol es requerido';
    if (!formData.genero) errors.genero = 'El género es requerido';

    // Validaciones específicas para entrenadores
    if (formData.rol === 'ENTRENADOR') {
      // Validar tipo de instructor
      if (!formData.tipoInstructor) {
        errors.tipoInstructor = 'Debe seleccionar el tipo de instructor';
      }

      // Validar especialidades
      if (!formData.especialidadesIds || formData.especialidadesIds.length === 0) {
        errors.especialidadesIds = 'Debe seleccionar al menos una especialidad';
      }

      // Validar cupo máximo para instructores premium
      if (formData.tipoInstructor === 'PREMIUM') {
        if (!formData.cupoMaximo) {
          errors.cupoMaximo = 'El cupo máximo es requerido para entrenadores premium';
        } else if (parseInt(formData.cupoMaximo) <= 0) {
          errors.cupoMaximo = 'El cupo máximo debe ser mayor a 0';
        }
      }
    }

    // Validaciones para empleados (entrenadores y recepcionistas)
    if (formData.rol === 'ENTRENADOR' || formData.rol === 'RECEPCIONISTA') {
      if (!formData.ruc) errors.ruc = 'El RUC es requerido para empleados';
      if (!formData.salario) errors.salario = 'El salario es requerido para empleados';
      if (!formData.fechaContratacion) errors.fechaContratacion = 'La fecha de contratación es requerida';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }    try {
      // Verificar si el DNI o correo ya existe antes de intentar registrar
      const checkResult = await checkExistingUser(formData.dni, formData.correo);
      if (checkResult.exists) {
        toast.error(checkResult.message, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
        return;
      }
      
      const data = await register(formData);
      if (!data) {
        throw new Error('Error al crear el usuario');
      }

      // Limpiar formulario después de éxito
      setFormData(initialFormData);
      setFormErrors({});      toast.success('Usuario creado exitosamente', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      
      // Si hay una función para actualizar la lista de usuarios, la llamamos
      if (onUserCreated) {
        onUserCreated();
      }
      
      onClose();
    } catch (error) {
      console.error('Error:', error);
      
      // Detectar errores comunes y mostrar mensajes más amigables
      if (error.message.includes('Duplicate entry') || error.message.includes('duplicado')) {
        toast.error('Ya existe un usuario con ese DNI o correo electrónico', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      } else if (error.message.includes('permisos')) {
        toast.error('No tienes permisos para crear usuarios', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      } else {
        toast.error(error.message || 'Error al crear el usuario', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      }
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50 modal-container">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Title>Crear Nuevo Usuario</Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información de Usuario */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre de Usuario
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
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

            {/* Información Personal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Apellidos
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  DNI
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Correo
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Celular
                </label>
                <TextInput
                  name="celular"
                  value={formData.celular}
                  onChange={handleInputChange}
                  placeholder="Ingrese número de celular"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento
                </label>
                <TextInput
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Género
                </label>
                <div className="select-wrapper">
                  <Select
                    name="genero"
                    value={formData.genero}
                    onValueChange={(value) => handleInputChange({ target: { name: 'genero', value } })}
                    className="custom-select"
                    error={formErrors.genero}
                  >
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </Select>
                </div>
                {formErrors.genero && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.genero}</p>
                )}
              </div>              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <div className="select-wrapper">
                  <Select
                    name="rol"
                    value={formData.rol}
                    onValueChange={(value) => handleInputChange({ target: { name: 'rol', value } })}
                    className="custom-select"
                    error={formErrors.rol}
                  >
                    <SelectItem value="CLIENTE">Cliente</SelectItem>
                    <SelectItem value="ENTRENADOR">Entrenador</SelectItem>
                    <SelectItem value="RECEPCIONISTA">Recepcionista</SelectItem>
                  </Select>
                </div>
                {formErrors.rol && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.rol}</p>
                )}
              </div>
            </div>

            {/* Campos específicos según el rol */}
            {formData.rol === 'CLIENTE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <TextInput
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Ingrese dirección"
                />
              </div>
            )}

            {(formData.rol === 'ENTRENADOR' || formData.rol === 'RECEPCIONISTA') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    RUC
                  </label>                  <TextInput
                    name="ruc"
                    value={formData.ruc}
                    onChange={handleInputChange}
                    placeholder="Ingrese RUC"
                    error={formErrors.ruc}
                  />
                  {formErrors.ruc && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.ruc}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Salario
                  </label>
                  <TextInput
                    type="number"
                    name="salario"
                    value={formData.salario}
                    onChange={handleInputChange}
                    placeholder="Ingrese salario"
                    error={formErrors.salario}
                  />
                  {formErrors.salario && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.salario}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Contratación
                  </label>
                  <TextInput
                    type="date"
                    name="fechaContratacion"
                    value={formData.fechaContratacion}
                    onChange={handleInputChange}
                    error={formErrors.fechaContratacion}
                  />
                  {formErrors.fechaContratacion && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.fechaContratacion}</p>
                  )}
                </div>
              </div>
            )}

            {formData.rol === 'ENTRENADOR' && (
              <div className="grid grid-cols-2 gap-4">                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Instructor
                  </label>
                  <div className="select-wrapper">
                    <Select
                      name="tipoInstructor"
                      value={formData.tipoInstructor}
                      onValueChange={(value) => handleInputChange({ target: { name: 'tipoInstructor', value } })}
                      className="custom-select"
                      error={formErrors.tipoInstructor}
                    >
                      <SelectItem value="ESTANDAR">Estándar</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                    </Select>
                  </div>
                  {formErrors.tipoInstructor && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.tipoInstructor}</p>
                  )}
                </div>
                {formData.tipoInstructor === 'PREMIUM' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cupo Máximo
                    </label>
                    <TextInput
                      type="number"
                      name="cupoMaximo"
                      value={formData.cupoMaximo}
                      onChange={handleInputChange}
                      placeholder="Ingrese cupo máximo"
                      error={formErrors.cupoMaximo}
                    />
                    {formErrors.cupoMaximo && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.cupoMaximo}</p>
                    )}
                  </div>
                )}                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Especialidades
                  </label>
                  <div className="select-wrapper">
                    <MultiSelect
                      value={formData.especialidadesIds}
                      onValueChange={handleEspecialidadesChange}
                      placeholder="Seleccione las especialidades"
                      className="custom-select"
                    >
                      {especialidades.map(especialidad => (
                        <MultiSelectItem key={especialidad.id} value={especialidad.id}>
                          {especialidad.nombre}
                        </MultiSelectItem>
                      ))}
                    </MultiSelect>
                  </div>
                  {formErrors.especialidadesIds && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.especialidadesIds}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <Button onClick={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Crear Usuario
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
