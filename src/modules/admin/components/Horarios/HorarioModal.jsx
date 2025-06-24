import React, { useState, useEffect } from 'react';
import { X } from 'react-feather';
import {
    Button,
    Select,
    SelectItem,
    TextInput,
    SearchSelect,
    SearchSelectItem
} from '@tremor/react';
import horarioEmpleadoAPI from '../../services/horarioEmpleadoAPI';
import { useAuth } from '../../../../shared/hooks/useAuth';

const DIAS_SEMANA = [
    'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'
];
const TURNOS = ['Mañana', 'Tarde', 'Noche'];

const HorarioModal = ({ isOpen, onClose, horario, empleados, onSuccess, isLoading }) => {
    const { token, checkRole } = useAuth();
    const [formData, setFormData] = useState({
        empleadoId: '',
        dia: '',
        horaInicio: '',
        horaFin: '',
        turno: '',
        estado: true
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (horario) {
            setFormData({
                empleadoId: horario.empleado?.idEmpleado || '',
                dia: horario.dia || '',
                horaInicio: formatTime(horario.horaInicio) || '',
                horaFin: formatTime(horario.horaFin) || '',
                turno: horario.turno || '',
                estado: horario.estado ?? true
            });
        } else {
            setFormData({
                empleadoId: '',
                dia: '',
                horaInicio: '',
                horaFin: '',
                turno: '',
                estado: true
            });
        }
        setFormErrors({});
    }, [horario]);

    const formatTime = (time) => {
        if (!time) return '';
        if (time.includes('T')) {
            return time.split('T')[1].substring(0, 5);
        }
        return time;
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.empleadoId) {
            errors.empleadoId = 'Debe seleccionar un empleado';
        }
        if (!formData.dia || !DIAS_SEMANA.includes(formData.dia)) {
            errors.dia = 'Debe seleccionar un día válido';
        }
        if (!formData.horaInicio) {
            errors.horaInicio = 'Debe especificar la hora de inicio';
        }
        if (!formData.horaFin) {
            errors.horaFin = 'Debe especificar la hora de fin';
        }
        if (!formData.turno || !TURNOS.includes(formData.turno)) {
            errors.turno = 'Debe seleccionar un turno válido';
        }

        // Validar que la hora de fin sea mayor que la hora de inicio
        if (formData.horaInicio && formData.horaFin) {
            const inicio = new Date(`1970-01-01T${formData.horaInicio}`);
            const fin = new Date(`1970-01-01T${formData.horaFin}`);
            if (fin <= inicio) {
                errors.horaFin = 'La hora de fin debe ser mayor que la hora de inicio';
            }
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {            const horarioData = {
                dia: formData.dia,
                horaInicio: formData.horaInicio.includes(':00') ? formData.horaInicio : formData.horaInicio + ':00',
                horaFin: formData.horaFin.includes(':00') ? formData.horaFin : formData.horaFin + ':00',
                turno: formData.turno,
                estado: formData.estado
            };if (horario?.idHorarioEmpleado) {
                console.log('Actualizando horario con ID:', horario.idHorarioEmpleado);
                console.log('Datos a enviar:', horarioData);
                await horarioEmpleadoAPI.actualizarHorario(horario.idHorarioEmpleado, {
                    ...horarioData,
                    idEmpleado: horario.empleado?.idEmpleado,  // Asegurarnos de incluir el ID del empleado
                    empleadoId: horario.empleado?.idEmpleado   // Backup en caso de que el backend espere empleadoId
                });
            } else {
                await horarioEmpleadoAPI.agregarHorario(formData.empleadoId, horarioData);
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error al guardar el horario:', error);
            setFormErrors({
                submit: error.message || 'Error al procesar el horario'
            });
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpiar error cuando el usuario modifica el campo
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-medium">
                            {horario ? 'Editar Horario' : 'Nuevo Horario'}
                        </h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* SearchSelect para empleados */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Empleado
                            </label>
                            <SearchSelect
                                value={formData.empleadoId}
                                onValueChange={(value) => handleInputChange('empleadoId', value)}
                                placeholder="Buscar empleado..."
                                disabled={isLoading}
                            >
                                {empleados.map((emp) => (
                                    <SearchSelectItem
                                        key={emp.idEmpleado}
                                        value={emp.idEmpleado.toString()}
                                    >
                                        {`${emp.nombre || ''} ${emp.apellidos || ''}`}
                                    </SearchSelectItem>
                                ))}
                            </SearchSelect>
                            {formErrors.empleadoId && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.empleadoId}</p>
                            )}
                        </div>

                        {/* Select para día */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Día
                            </label>
                            <Select
                                value={formData.dia}
                                onValueChange={(value) => handleInputChange('dia', value)}
                                placeholder="Seleccionar día"
                            >
                                {DIAS_SEMANA.map((dia) => (
                                    <SelectItem key={dia} value={dia}>
                                        {dia}
                                    </SelectItem>
                                ))}
                            </Select>
                            {formErrors.dia && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.dia}</p>
                            )}
                        </div>

                        {/* Select para turno */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Turno
                            </label>
                            <Select
                                value={formData.turno}
                                onValueChange={(value) => handleInputChange('turno', value)}
                                placeholder="Seleccionar turno"
                            >
                                {TURNOS.map((turno) => (
                                    <SelectItem key={turno} value={turno}>
                                        {turno}
                                    </SelectItem>
                                ))}
                            </Select>
                            {formErrors.turno && (
                                <p className="text-red-500 text-xs mt-1">{formErrors.turno}</p>
                            )}
                        </div>

                        {/* Inputs de hora */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hora inicio
                                </label>
                                <TextInput
                                    type="time"
                                    value={formData.horaInicio}
                                    onChange={(e) => handleInputChange('horaInicio', e.target.value)}
                                    placeholder="Hora inicio"
                                />
                                {formErrors.horaInicio && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.horaInicio}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Hora fin
                                </label>
                                <TextInput
                                    type="time"
                                    value={formData.horaFin}
                                    onChange={(e) => handleInputChange('horaFin', e.target.value)}
                                    placeholder="Hora fin"
                                />
                                {formErrors.horaFin && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.horaFin}</p>
                                )}
                            </div>
                        </div>

                        {formErrors.submit && (
                            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                                {formErrors.submit}
                            </div>
                        )}

                        <div className="flex justify-end space-x-4 mt-6">
                            <Button variant="secondary" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                variant="primary"
                                disabled={isLoading}
                            >
                                {horario ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HorarioModal;
