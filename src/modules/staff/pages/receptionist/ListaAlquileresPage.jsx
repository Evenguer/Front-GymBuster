import React, { useState, useEffect } from 'react';
import { alquilerAPI } from '../../services/alquilerAPI';
import { ESTADO_ALQUILER, ESTADO_ALQUILER_INFO } from '../../constants/alquilerEstados';
import {
  Card,
  Title,
  Text,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Button,
  Dialog,
  DialogPanel,
  Flex,
  Select,
  SelectItem
} from '@tremor/react';
import { 
  Eye, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Printer, 
  FileText, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  Ban,
  ArrowDownCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Estilos para impresión
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .dialog-print-content, .dialog-print-content * {
      visibility: visible;
    }
    .dialog-print-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: auto;
      padding: 20px;
    }
    .no-print {
      display: none !important;
    }
    .print-break-after {
      page-break-after: always;
    }
  }
`;

const ListaAlquileresPage = () => {
  const [alquileres, setAlquileres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detalleAlquiler, setDetalleAlquiler] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);

  const cargarAlquileres = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Iniciando carga de alquileres...');
      
      const response = await alquilerAPI.listarAlquileres();
      console.log('Datos crudos del servidor:', response);
      
      if (!Array.isArray(response)) {
        console.error('La respuesta no es un array:', response);
        throw new Error('Formato de respuesta inválido');
      }
      
      // Mostrar cada alquiler en detalle para debugging
      response.forEach((alquiler, index) => {
        console.log(`Alquiler ${index + 1}:`, {
          ID: alquiler.idAlquiler,
          Cliente: `${alquiler.clienteNombre} ${alquiler.clienteApellido}`,
          FechaInicio: alquiler.fechaInicio,
          FechaFin: alquiler.fechaFin,
          Total: alquiler.total,
          Estado: alquiler.estado || ESTADO_ALQUILER.ACTIVO,
          MetodoPago: alquiler.metodoPago,
          Detalles: alquiler.detalles
        });
      });
      
      // Formatear los datos para mostrarlos en la tabla
      const alquileresFormateados = response.map(alquiler => {
        const fechaFinObj = alquiler.fechaFin ? new Date(alquiler.fechaFin) : null;
        
        // Determinar si hay devolución pendiente
        const tienePiezasPendientes = Array.isArray(alquiler.detalles) && 
          alquiler.detalles.some(detalle => !detalle.devuelto);
        
        return {
          idAlquiler: alquiler.idAlquiler,
          cliente: `${alquiler.clienteNombre} ${alquiler.clienteApellido}`,
          clienteDni: alquiler.clienteDni,
          empleado: `${alquiler.empleadoNombre} ${alquiler.empleadoApellido}`,
          fechaInicio: alquiler.fechaInicio ? formatearFecha(alquiler.fechaInicio) : 'N/A',
          fechaFin: alquiler.fechaFin ? formatearFecha(alquiler.fechaFin) : 'N/A', 
          fechaInicioObj: alquiler.fechaInicio ? new Date(alquiler.fechaInicio) : null,
          fechaFinObj: fechaFinObj,
          devolucionPendiente: tienePiezasPendientes,
          total: alquiler.total || 0,
          estado: alquiler.estado || ESTADO_ALQUILER.ACTIVO,
          metodoPago: alquiler.metodoPago || 'No registrado',
          idPago: alquiler.idPago,
          montoPagado: alquiler.montoPagado,
          vuelto: alquiler.vuelto,
          detalles: (alquiler.detalles || []).map(detalle => ({
            idDetalleAlquiler: detalle.idDetalleAlquiler,
            pieza: detalle.piezaNombre,
            piezaId: detalle.piezaId,
            cantidad: detalle.cantidad || 0,
            precioUnitario: detalle.precioUnitario || 0,
            subtotal: detalle.subtotal || 0,
            devuelto: detalle.devuelto || false
          }))
        };
      });

      console.log('Alquileres formateados:', alquileresFormateados);
      setAlquileres(alquileresFormateados);
      
      // Guardar en localStorage para acceso rápido
      localStorage.setItem('alquileres', JSON.stringify(alquileresFormateados));
      
    } catch (err) {
      console.error('Error al cargar alquileres:', err);
      setError('Error al cargar el historial de alquileres: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = (alquilerId) => {
    try {
      // Buscar el alquiler en los datos que ya tenemos
      const alquiler = alquileres.find(a => a.idAlquiler === alquilerId);
      
      if (!alquiler) {
        throw new Error('Alquiler no encontrado');
      }

      // Determinar si la fecha de fin ya pasó (para mostrar alertas)
      const estaVencido = alquiler.fechaFinObj && new Date() > alquiler.fechaFinObj && 
                         alquiler.estado === ESTADO_ALQUILER.ACTIVO;

      // Usar los datos existentes
      const detalleValidado = {
        ...alquiler,
        detalles: alquiler.detalles || [],
        pagado: alquiler.idPago != null,
        estaVencido: estaVencido
      };

      console.log('Detalle de alquiler:', detalleValidado);
      setDetalleAlquiler(detalleValidado);
      setModalDetalle(true);
    } catch (err) {
      console.error('Error al cargar detalle del alquiler:', err);
      setError('Error al cargar detalle: ' + err.message);
    }
  };

  const cerrarDetalle = () => {
    setModalDetalle(false);
    setTimeout(() => setDetalleAlquiler(null), 300);
  };

  // Método para cambiar estado de alquiler
  const cambiarEstadoAlquiler = async (id, nuevoEstado) => {
    try {
      setLoading(true);
      
      // Llamar al método específico según el nuevo estado
      switch (nuevoEstado) {
        case ESTADO_ALQUILER.FINALIZADO:
          await alquilerAPI.finalizarAlquiler(id);
          break;
        case ESTADO_ALQUILER.CANCELADO:
          await alquilerAPI.cancelarAlquiler(id);
          break;
        case ESTADO_ALQUILER.VENCIDO:
          await alquilerAPI.marcarVencido(id);
          break;
        default:
          await alquilerAPI.cambiarEstadoAlquiler(id, nuevoEstado);
      }
      
      // Actualizar la lista de alquileres localmente
      setAlquileres(alquileres.map(alquiler => 
        alquiler.idAlquiler === id ? { ...alquiler, estado: nuevoEstado } : alquiler
      ));
      
      // Si hay un detalle abierto, actualizarlo
      if (detalleAlquiler && detalleAlquiler.idAlquiler === id) {
        setDetalleAlquiler({ ...detalleAlquiler, estado: nuevoEstado });
      }
      
      const estadoInfo = ESTADO_ALQUILER_INFO[nuevoEstado];
      console.log(`Estado del alquiler ${id} cambiado a ${estadoInfo?.label || nuevoEstado}`);
      setError(null);
    } catch (err) {
      console.error('Error al cambiar el estado del alquiler:', err);
      setError('Error al cambiar el estado: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Método para registrar devolución
  const registrarDevolucion = async (id) => {
    try {
      setLoading(true);
      await alquilerAPI.registrarDevolucion(id);
      
      // Actualizar la lista de alquileres localmente
      setAlquileres(alquileres.map(alquiler => 
        alquiler.idAlquiler === id ? { 
          ...alquiler, 
          devolucionPendiente: false,
          detalles: alquiler.detalles.map(detalle => ({...detalle, devuelto: true}))
        } : alquiler
      ));
      
      if (detalleAlquiler && detalleAlquiler.idAlquiler === id) {
        setDetalleAlquiler({ 
          ...detalleAlquiler, 
          devolucionPendiente: false,
          detalles: detalleAlquiler.detalles.map(detalle => ({...detalle, devuelto: true}))
        });
      }
      
      // Una vez registrada la devolución, finalizamos el alquiler
      await cambiarEstadoAlquiler(id, ESTADO_ALQUILER.FINALIZADO);
      
      setError(null);
      console.log(`Devolución registrada y alquiler finalizado con ID ${id}`);
    } catch (err) {
      console.error('Error al registrar devolución:', err);
      setError('Error al registrar devolución: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  const formatearFecha = (fechaStr) => {
    try {
      if (!fechaStr) return 'Sin fecha';
      const date = new Date(fechaStr);
      date.setDate(date.getDate() + 1);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return fechaStr || 'Fecha inválida';
    }
  };
  
  const convertirNumeroALetras = (numero) => {
    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    
    if (numero === 0) return 'CERO';
    
    // Convertimos el número a un string para facilitar su manipulación
    const str = numero.toFixed(2);
    const partes = str.split('.');
    const entero = parseInt(partes[0]);
    const decimal = parseInt(partes[1]);
    
    // Procesamos la parte entera
    let resultado = '';
    
    if (entero < 10) {
      resultado = unidades[entero];
    } else if (entero < 20) {
      resultado = especiales[entero - 10];
    } else if (entero < 100) {
      const unidad = entero % 10;
      const decena = Math.floor(entero / 10);
      
      if (unidad === 0) {
        resultado = decenas[decena];
      } else {
        resultado = decenas[decena] + ' Y ' + unidades[unidad];
      }
    } else {
      resultado = 'NÚMERO FUERA DE RANGO';
    }
    
    // Añadimos la parte decimal si es necesario
    if (decimal > 0) {
      resultado += ' CON ' + decimal + ' SOLES';
    } else {
      resultado += ' CON 00 SOLES';
    }
    
    return resultado;
  };
  
  // Cargar alquileres al inicio
  useEffect(() => {
    cargarAlquileres();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="p-4">
      <style>{printStyles}</style>
      <Card>
        <Flex justifyContent="between" alignItems="center" className="mb-2">
          <Title>Historial de alquileres</Title>
          <Button 
            onClick={cargarAlquileres} 
            variant="secondary"
            size="xs"
            disabled={loading}
            className="px-2 py-1"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-1" size={14} />
                Cargando...
              </>
            ) : (
              'Actualizar'
            )}
          </Button>
        </Flex>
        
        <div className="mb-2 bg-gray-50 p-1 rounded text-center">
          <Text className="text-gray-600 text-xs">
            <span className="font-medium">Leyenda:</span> La columna <span className="font-medium">Estado</span> muestra el estado principal del alquiler y el estado de devolución de los productos.
          </Text>
        </div>
        
        {error && (
          <div className="mb-4 p-2 border border-red-200 bg-red-50 rounded">
            <Text className="text-red-600">{error}</Text>
          </div>
        )}
        
        {loading && !alquileres.length ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="animate-spin mr-2" size={20} />
            <Text className="text-gray-500 text-sm">Cargando alquileres...</Text>
          </div>
        ) : (
          <Table className="w-full border-collapse [&_tbody_tr:nth-of-type(even)]:bg-gray-50">
            <TableHead>
              <TableRow className="[&>*]:p-1.5 bg-gray-100">
                <TableHeaderCell className="w-10 text-center">ID</TableHeaderCell>
                <TableHeaderCell className="w-36">Cliente</TableHeaderCell>
                <TableHeaderCell className="w-24 text-center">Inicio</TableHeaderCell>
                <TableHeaderCell className="w-24 text-center">Fin</TableHeaderCell>
                <TableHeaderCell className="w-20 text-right">Total</TableHeaderCell>
                <TableHeaderCell className="w-32 text-center">Estado</TableHeaderCell>
                <TableHeaderCell className="w-24 text-center">Pago</TableHeaderCell>
                <TableHeaderCell className="w-28 text-center">Acciones</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alquileres.map((alquiler) => {
                // Obtenemos la información del estado actual
                const estadoInfo = ESTADO_ALQUILER_INFO[alquiler.estado] || {
                  label: 'Desconocido',
                  color: 'gray'
                };
                
                // Decidimos qué icono mostrar según el estado
                let EstadoIcon;
                switch(alquiler.estado) {
                  case ESTADO_ALQUILER.ACTIVO:
                    EstadoIcon = CheckCircle;
                    break;
                  case ESTADO_ALQUILER.FINALIZADO:
                    EstadoIcon = CheckCircle;
                    break;
                  case ESTADO_ALQUILER.VENCIDO:
                    EstadoIcon = AlertTriangle;
                    break;
                  case ESTADO_ALQUILER.CANCELADO:
                    EstadoIcon = Ban;
                    break;
                  default:
                    EstadoIcon = null;
                }
                
                return (
                  <TableRow key={alquiler.idAlquiler} className="[&>*]:p-1 border-t border-gray-100 hover:bg-gray-50">
                    <TableCell className="text-center">{alquiler.idAlquiler}</TableCell>
                    <TableCell className="truncate">{alquiler.cliente}</TableCell>
                    <TableCell className="text-center">{alquiler.fechaInicio}</TableCell>
                    <TableCell className="text-center">{alquiler.fechaFin}</TableCell>
                    <TableCell className="text-right">
                      <Text className="font-medium">S/ {alquiler.total.toFixed(2)}</Text>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        <Badge
                          color={estadoInfo.color}
                          icon={EstadoIcon}
                          className="justify-center text-xs px-1 py-0.5 w-28 mx-auto"
                          size="xs"
                        >
                          {estadoInfo.label}
                        </Badge>
                        
                        {/* Estado de devolución dependiendo del estado actual */}
                        {(alquiler.estado === ESTADO_ALQUILER.ACTIVO || 
                          alquiler.estado === ESTADO_ALQUILER.VENCIDO) && (
                          <Badge
                            color={alquiler.devolucionPendiente ? "amber" : "green"}
                            icon={alquiler.devolucionPendiente ? Clock : CheckCircle}
                            className="justify-center text-xs px-1 py-0.5 w-28 mx-auto"
                            size="xs"
                          >
                            {alquiler.devolucionPendiente ? 'Por devolver' : 'Devuelto'}
                          </Badge>
                        )}
                        
                        {/* Si está finalizado, mostrar siempre "Devuelto" */}
                        {alquiler.estado === ESTADO_ALQUILER.FINALIZADO && (
                          <Badge
                            color="green"
                            icon={CheckCircle}
                            className="justify-center text-xs px-1 py-0.5 w-28 mx-auto"
                            size="xs"
                          >
                            Devuelto
                          </Badge>
                        )}

                        {/* Si está cancelado, mostrar "No aplica" como estado de devolución */}
                        {alquiler.estado === ESTADO_ALQUILER.CANCELADO && (
                          <Badge
                            color="gray"
                            icon={Ban}
                            className="justify-center text-xs px-1 py-0.5 w-28 mx-auto"
                            size="xs"
                          >
                            No aplica
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        color={alquiler.idPago ? "green" : "gray"}
                        className="text-xs px-1 py-0.5 w-20 mx-auto"
                        size="xs"
                      >
                        {alquiler.idPago ? `${alquiler.metodoPago}` : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        {/* Botón Ver detalle con texto e icono */}
                        <Button
                          icon={Eye}
                          variant="secondary"
                          size="xs"
                          onClick={() => verDetalle(alquiler.idAlquiler)}
                          className="text-xs px-2 py-1"
                        >
                          Ver Detalle
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {alquileres.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                    No hay alquileres registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
      
      {/* Modal de detalle */}
      {modalDetalle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-2xl my-4">
            <Card className="dialog-print-content p-6">
              {detalleAlquiler && (
                <div className="space-y-4">
                  {/* Encabezado de la Empresa */}
                  <div className="text-center border-b pb-4">
                    <img 
                      src="/src/assets/LOGO BUSSTER GYM.png" 
                      alt="Logo Busster Gym" 
                      className="h-16 mx-auto mb-2"
                    />
                    <Text className="font-bold text-xl">BUSSTER GYM S.A.C</Text>
                    <Text className="text-gray-600">R.U.C. 20100100100</Text>
                    <Text className="text-gray-600">Jr. Las Palmeras 123 - Lima</Text>
                    <Text className="text-gray-600">Telf: (01) 123-4567</Text>
                  </div>

                  {/* Título y Número de Comprobante */}
                  <div className="text-center border-b pb-4">
                    <Text className="font-bold text-lg">COMPROBANTE DE ALQUILER</Text>
                    <Text className="font-medium">A002-{String(detalleAlquiler.idAlquiler).padStart(8, '0')}</Text>
                    <div className="flex justify-center mt-3">
                      <div>
                        {/* Badge unificado que muestra el estado general y el estado de devolución */}
                        {(() => {
                          const estadoInfo = ESTADO_ALQUILER_INFO[detalleAlquiler.estado] || {
                            label: 'Desconocido',
                            color: 'gray'
                          };
                          
                          let EstadoIcon;
                          let estadoTexto = estadoInfo.label;
                          let estadoColor = estadoInfo.color;
                          
                          // Decidir el icono basado en el estado
                          switch(detalleAlquiler.estado) {
                            case ESTADO_ALQUILER.ACTIVO:
                              EstadoIcon = CheckCircle;
                              estadoTexto += detalleAlquiler.devolucionPendiente ? 
                                " (Por devolver)" : " (Devuelto)";
                              break;
                            case ESTADO_ALQUILER.FINALIZADO:
                              EstadoIcon = CheckCircle;
                              estadoTexto += " (Devuelto)";
                              break;
                            case ESTADO_ALQUILER.VENCIDO:
                              EstadoIcon = AlertTriangle;
                              estadoTexto += detalleAlquiler.devolucionPendiente ? 
                                " (Por devolver)" : " (Devuelto)";
                              break;
                            case ESTADO_ALQUILER.CANCELADO:
                              EstadoIcon = Ban;
                              break;
                            default:
                              EstadoIcon = null;
                          }
                          
                          return (
                            <Badge 
                              color={estadoColor}
                              icon={EstadoIcon}
                              className="justify-center text-xs px-3 py-1"
                              size="md"
                            >
                              {estadoTexto}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Información del Cliente */}
                  <div className="text-sm space-y-2 border-b pb-4">
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">Fecha inicio:</Text>
                      <Text>{formatearFecha(detalleAlquiler.fechaInicio)}</Text>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">Fecha fin:</Text>
                      <Text>{formatearFecha(detalleAlquiler.fechaFin)}</Text>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">Cliente:</Text>
                      <Text>{detalleAlquiler.cliente}</Text>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">DNI:</Text>
                      <Text>{detalleAlquiler.clienteDni || 'Sin DNI'}</Text>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-2">
                      <Text className="font-medium">Empleado:</Text>
                      <Text>{detalleAlquiler.empleado}</Text>
                    </div>
                  </div>

                  {/* Tabla de Piezas Alquiladas */}
                  <div className="text-sm">
                    <Text className="font-medium text-gray-700 mb-2">DETALLE DE PIEZAS ALQUILADAS</Text>
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left [&>th]:py-2 [&>th]:text-xs [&>th]:font-medium [&>th]:text-gray-500">
                          <th>CANT.</th>
                          <th>DESCRIPCIÓN</th>
                          <th className="text-right">P.UNIT</th>
                          <th className="text-right">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="[&>tr]:border-b [&>tr]:border-gray-100">
                        {detalleAlquiler.detalles.map((detalle, index) => (
                          <tr key={detalle.idDetalleAlquiler || index} className="[&>td]:py-2">
                            <td>{detalle.cantidad}</td>
                            <td>{detalle.pieza}</td>
                            <td className="text-right">S/ {detalle.precioUnitario.toFixed(2)}</td>
                            <td className="text-right">S/ {detalle.subtotal.toFixed(2)}</td>
                          </tr>
                        ))}
                        {detalleAlquiler.detalles.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center py-4">No hay piezas alquiladas</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Totales y Detalles de Pago */}
                  <div className="text-sm space-y-2 pt-2">
                    <div className="grid grid-cols-2 text-right gap-2 border-t pt-2">
                      <Text className="font-bold">TOTAL:</Text>
                      <Text className="font-bold">S/ {detalleAlquiler.total.toFixed(2)}</Text>
                    </div>
                    <Text>SON: {convertirNumeroALetras(detalleAlquiler.total)}</Text>
                  </div>

                  {/* Información de Pago */}
                  <div className="text-sm space-y-2 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Text className="font-medium">Estado de pago:</Text>
                        <Badge color={detalleAlquiler.idPago ? "green" : "yellow"} className="text-xs px-2 py-0.5">
                          {detalleAlquiler.idPago ? 'PAGADO' : 'PENDIENTE'}
                        </Badge>
                      </div>
                      
                      {detalleAlquiler.idPago && (
                        <div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Text className="font-medium">Forma de Pago:</Text>
                              <Text>{detalleAlquiler.metodoPago}</Text>
                            </div>
                            <div>
                              <Text className="font-medium">Monto Pagado:</Text>
                              <Text>S/ {detalleAlquiler.montoPagado?.toFixed(2) || '0.00'}</Text>
                            </div>
                          </div>
                          {detalleAlquiler.vuelto && detalleAlquiler.vuelto > 0 && (
                            <div className="mt-2">
                              <Text className="font-medium">Vuelto:</Text>
                              <Text>S/ {detalleAlquiler.vuelto.toFixed(2)}</Text>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="mt-6 pt-4 border-t border-gray-200 no-print">
                    <div className="mb-3">
                      <Text className="font-medium text-gray-700">Acciones disponibles:</Text>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {/* Botón de devolución - Solo visible en estado ACTIVO o VENCIDO con devolución pendiente */}
                      {(detalleAlquiler.estado === ESTADO_ALQUILER.ACTIVO || detalleAlquiler.estado === ESTADO_ALQUILER.VENCIDO) && 
                       detalleAlquiler.devolucionPendiente && (
                        <Button
                          icon={ArrowDownCircle}
                          variant="secondary"
                          color="green"
                          onClick={() => registrarDevolucion(detalleAlquiler.idAlquiler)}
                          disabled={loading}
                          className="justify-start"
                        >
                          <span className="flex items-center">
                            <ArrowDownCircle className="mr-2" size={16} />
                            Registrar devolución
                          </span>
                        </Button>
                      )}
                      
                      {/* Botón para finalizar - Solo en ACTIVO sin devoluciones pendientes */}
                      {detalleAlquiler.estado === ESTADO_ALQUILER.ACTIVO && !detalleAlquiler.devolucionPendiente && (
                        <Button
                          variant="secondary"
                          color="blue"
                          onClick={() => cambiarEstadoAlquiler(detalleAlquiler.idAlquiler, ESTADO_ALQUILER.FINALIZADO)}
                          disabled={loading}
                          className="justify-start"
                        >
                          <span className="flex items-center">
                            <CheckCircle className="mr-2" size={16} />
                            Finalizar alquiler
                          </span>
                        </Button>
                      )}
                      
                      {/* Botón para cancelar - Solo en ACTIVO */}
                      {detalleAlquiler.estado === ESTADO_ALQUILER.ACTIVO && (
                        <Button
                          variant="secondary"
                          color="red"
                          onClick={() => cambiarEstadoAlquiler(detalleAlquiler.idAlquiler, ESTADO_ALQUILER.CANCELADO)}
                          disabled={loading}
                          className="justify-start"
                        >
                          <span className="flex items-center">
                            <XCircle className="mr-2" size={16} />
                            Cancelar alquiler
                          </span>
                        </Button>
                      )}
                      
                      {/* Botón marcar como vencido - Solo en ACTIVO y fecha de fin pasada */}
                      {detalleAlquiler.estado === ESTADO_ALQUILER.ACTIVO && 
                       detalleAlquiler.fechaFinObj && new Date() > detalleAlquiler.fechaFinObj && (
                        <Button
                          variant="secondary"
                          color="amber"
                          onClick={() => cambiarEstadoAlquiler(detalleAlquiler.idAlquiler, ESTADO_ALQUILER.VENCIDO)}
                          disabled={loading}
                          className="justify-start"
                        >
                          <span className="flex items-center">
                            <AlertTriangle className="mr-2" size={16} />
                            Marcar como vencido
                          </span>
                        </Button>
                      )}
                      
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <Button
                        variant="secondary"
                        color="gray"
                        onClick={() => {
                          window.print();
                        }}
                        icon={Printer}
                      >
                        Imprimir comprobante
                      </Button>
                      <Button
                        variant="primary"
                        onClick={cerrarDetalle}
                      >
                        Cerrar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaAlquileresPage;
