import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    Card,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Title,
    Badge,
    Button,
    TextInput,
    Flex,
} from '@tremor/react';
import { Search, PlusCircle, Edit2, Trash2 } from 'react-feather';
import horarioEmpleadoAPI from '../services/horarioEmpleadoAPI';
import { getEmployees } from '../services/personaAPI';
import toast from 'react-hot-toast';
import HorarioModal from '../components/Horarios/HorarioModal';

// Componente de fila memorizado
const HorarioRow = memo(({ horario, onToggleEstado, onEdit, onDelete, loadingId }) => {
    const isLoading = loadingId === horario.idHorarioEmpleado;
    
    return (
        <TableRow key={horario.idHorarioEmpleado}>
            <TableCell>
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                        {horario.empleado?.nombre} {horario.empleado?.apellidos}
                    </span>
                    <Badge 
                        className="mt-1 w-fit" 
                        color={
                            horario.empleado?.rol === 'ENTRENADOR' ? 'blue' : 
                            horario.empleado?.rol === 'ADMIN' ? 'red' : 
                            horario.empleado?.rol === 'RECEPCIONISTA' ? 'orange' : 
                            'gray'
                        }
                    >
                        {horario.empleado?.rol || 'No asignado'}
                    </Badge>
                </div>
            </TableCell>
            <TableCell>{horario.dia}</TableCell>
            <TableCell>{horario.turno}</TableCell>
            <TableCell>{horario.horaInicio}</TableCell>
            <TableCell>{horario.horaFin}</TableCell>
            <TableCell>
                <button
                    onClick={() => onToggleEstado(horario.idHorarioEmpleado, horario.estado)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none ${
                        isLoading ? 'opacity-50 cursor-not-allowed' :
                        horario.estado ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    disabled={isLoading}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            horario.estado ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>                <span className="ml-2 text-sm">
                    {horario.estado ? 'Activo' : 'Inactivo'}
                </span>
            </TableCell>
            <TableCell>
                <Flex justifyContent="start" className="gap-2">
                    <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => onEdit(horario)}
                        disabled={isLoading}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        size="xs"
                        variant="secondary"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onDelete(horario.idHorarioEmpleado)}
                        disabled={isLoading}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </Flex>
            </TableCell>
        </TableRow>
    );
});

const DIAS_SEMANA = [
    'LUNES',
    'MARTES',
    'MIERCOLES',
    'JUEVES',
    'VIERNES',
    'SABADO',
    'DOMINGO'
];

const TURNOS = ['MAÑANA', 'TARDE', 'NOCHE'];

const HorarioPage = () => {
    const [horarios, setHorarios] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedHorario, setSelectedHorario] = useState(null);
    const [empleados, setEmpleados] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null);

    const fetchHorarios = async () => {
        setIsLoading(true);
        try {
            const data = await horarioEmpleadoAPI.listarHorarios();
            console.log('Horarios cargados (datos completos):', data);
            // Verificar la estructura de cada horario
            data.forEach((horario, index) => {
                console.log(`Horario ${index}:`, {
                    id: horario.idHorarioEmpleado,
                    empleado: horario.empleado,
                    dia: horario.dia,
                    estado: horario.estado
                });
            });
            setHorarios(data);
        } catch (error) {
            console.error('Error al cargar horarios:', error);
            toast.error('Error al cargar los horarios');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmpleados = async () => {
        try {
            const data = await getEmployees();
            setEmpleados(data);
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            toast.error('Error al cargar los empleados');
        }
    };

    useEffect(() => {
        fetchHorarios();
        fetchEmpleados();
    }, []);

    const handleToggleEstado = useCallback(async (id, estadoActual) => {
        if (!id) {
            console.error('ID no válido:', id);
            toast.error('Error: ID de horario no válido');
            return;
        }

        setLoadingId(id);
        console.log('Intentando cambiar estado:', { id, estadoActual, nuevoEstado: !estadoActual });
        
        try {
            await horarioEmpleadoAPI.cambiarEstadoHorario(id, !estadoActual);
            setHorarios(prevHorarios => 
                prevHorarios.map(h => 
                    h.idHorarioEmpleado === id 
                        ? { ...h, estado: !estadoActual } 
                        : h
                )
            );
            toast.success('Estado actualizado exitosamente');
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            toast.error(error.message || 'Error al cambiar el estado');
        } finally {
            // Simular un pequeño delay para mostrar el estado de carga
            setTimeout(() => {
                setLoadingId(null);
            }, 500);
        }
    }, []);

    const handleSave = async (empleadoId, horarioData) => {
        try {
            if (selectedHorario) {
                await horarioEmpleadoAPI.actualizarHorario(selectedHorario.idHorarioEmpleado, horarioData);
                toast.success('Horario actualizado exitosamente');
            } else {
                await horarioEmpleadoAPI.agregarHorario(empleadoId, horarioData);
                toast.success('Horario creado exitosamente');
            }
            await fetchHorarios();
            setShowModal(false);
            setSelectedHorario(null);
        } catch (error) {
            console.error('Error al guardar horario:', error);
            toast.error(error.message || 'Error al procesar el horario');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este horario?')) {
            try {
                await horarioEmpleadoAPI.eliminarHorario(id);
                toast.success('Horario eliminado exitosamente');
                await fetchHorarios();
            } catch (error) {
                toast.error(error.message || 'Error al eliminar el horario');
            }
        }
    };

    const filteredHorarios = horarios.filter(horario => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            (horario.empleado?.nombre + ' ' + horario.empleado?.apellidos)
                .toLowerCase()
                .includes(searchLower) ||
            horario.dia.toLowerCase().includes(searchLower) ||
            horario.turno.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="p-4 space-y-4">
            <Card>
                <Flex justifyContent="between" className="mb-4">
                    <Title>Gestión de Horarios</Title>
                    <div className="flex space-x-2">
                        <TextInput
                            icon={Search}
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs"
                        />                        <Button
                            size="sm"
                            variant="primary"
                            icon={PlusCircle}
                            onClick={() => {
                                setSelectedHorario(null);
                                setShowModal(true);
                            }}
                        >
                            Nuevo Horario
                        </Button>
                    </div>
                </Flex>

                <Table>                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>
                                <div>
                                    <span>Empleado</span>
                                    <span className="block text-xs font-normal text-gray-500">Nombre y Rol</span>
                                </div>
                            </TableHeaderCell>
                            <TableHeaderCell>Día</TableHeaderCell>
                            <TableHeaderCell>Turno</TableHeaderCell>
                            <TableHeaderCell>Hora Inicio</TableHeaderCell>
                            <TableHeaderCell>Hora Fin</TableHeaderCell>
                            <TableHeaderCell>Estado</TableHeaderCell>
                            <TableHeaderCell>Acciones</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    Cargando...
                                </TableCell>
                            </TableRow>
                        ) : filteredHorarios.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No hay horarios disponibles
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredHorarios.map((horario) => (
                                <HorarioRow
                                    key={horario.idHorarioEmpleado}
                                    horario={horario}
                                    onToggleEstado={handleToggleEstado}
                                    onEdit={(h) => {
                                        setSelectedHorario(h);
                                        setShowModal(true);
                                    }}
                                    onDelete={handleDelete}
                                    loadingId={loadingId}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>            <HorarioModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                horario={selectedHorario}
                empleados={empleados}
                isLoading={isLoading}
                onSuccess={() => {
                    fetchHorarios();
                    setShowModal(false);
                }}
            />
        </div>
    );
};

export default HorarioPage;
