import React, { useState, useEffect } from 'react';
import { alquilerAPI } from '../../services/alquilerAPI';
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
  Flex
} from '@tremor/react';
import { Eye, Loader2, CheckCircle, XCircle } from 'lucide-react';

const ListaAlquileresPage = () => {
  const [alquileres, setAlquileres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detalleAlquiler, setDetalleAlquiler] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);

  useEffect(() => {
    cargarAlquileres();
  }, []);

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
          Estado: alquiler.estado ? 'ACTIVO' : 'FINALIZADO',
          MetodoPago: alquiler.metodoPago,
          Detalles: alquiler.detalles
        });
      });
      
      // Formatear los datos para mostrarlos en la tabla
      const alquileresFormateados = response.map(alquiler => ({
        idAlquiler: alquiler.idAlquiler,
        cliente: `${alquiler.clienteNombre} ${alquiler.clienteApellido}`,
        clienteDni: alquiler.clienteDni,
        empleado: `${alquiler.empleadoNombre} ${alquiler.empleadoApellido}`,
        fechaInicio: alquiler.fechaInicio ? new Date(alquiler.fechaInicio).toLocaleDateString() : 'N/A',
        fechaFin: alquiler.fechaFin ? new Date(alquiler.fechaFin).toLocaleDateString() : 'N/A',
        total: alquiler.total || 0,
        estado: alquiler.estado,
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
          subtotal: detalle.subtotal || 0
        }))
      }));

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

      // Usar los datos existentes
      const detalleValidado = {
        ...alquiler,
        detalles: alquiler.detalles || [],
        pagado: alquiler.idPago != null
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

  const cambiarEstadoAlquiler = async (id, estado) => {
    try {
      setLoading(true);
      const nuevoEstado = !estado;
      await alquilerAPI.cambiarEstadoAlquiler(id, nuevoEstado);
      
      // Actualizar la lista de alquileres localmente
      setAlquileres(alquileres.map(alquiler => 
        alquiler.idAlquiler === id ? { ...alquiler, estado: nuevoEstado } : alquiler
      ));
      
      if (detalleAlquiler && detalleAlquiler.idAlquiler === id) {
        setDetalleAlquiler({ ...detalleAlquiler, estado: nuevoEstado });
      }
      
      console.log(`Estado del alquiler ${id} cambiado a ${nuevoEstado ? 'Activo' : 'Finalizado'}`);
    } catch (err) {
      console.error('Error al cambiar el estado del alquiler:', err);
      setError('Error al cambiar el estado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4">
      <Card>
        <Flex justifyContent="between" alignItems="center" className="mb-4">
          <Title>Historial de alquileres</Title>
          <Button 
            onClick={cargarAlquileres} 
            variant="secondary"
            size="sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Cargando...
              </>
            ) : (
              'Actualizar'
            )}
          </Button>
        </Flex>
        
        {error && (
          <div className="mb-4 p-2 border border-red-200 bg-red-50 rounded">
            <Text className="text-red-600">{error}</Text>
          </div>
        )}
        
        {loading && !alquileres.length ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin mr-2" size={24} />
            <Text>Cargando alquileres...</Text>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Cliente</TableHeaderCell>
                <TableHeaderCell>Inicio</TableHeaderCell>
                <TableHeaderCell>Fin</TableHeaderCell>
                <TableHeaderCell>Total</TableHeaderCell>
                <TableHeaderCell>Estado</TableHeaderCell>
                <TableHeaderCell>Pago</TableHeaderCell>
                <TableHeaderCell>Acciones</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alquileres.map((alquiler) => (
                <TableRow key={alquiler.idAlquiler}>
                  <TableCell>{alquiler.idAlquiler}</TableCell>
                  <TableCell>{alquiler.cliente}</TableCell>
                  <TableCell>{alquiler.fechaInicio}</TableCell>
                  <TableCell>{alquiler.fechaFin}</TableCell>
                  <TableCell>S/ {alquiler.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      color={alquiler.estado ? "green" : "red"}
                      icon={alquiler.estado ? CheckCircle : XCircle}
                    >
                      {alquiler.estado ? 'Activo' : 'Finalizado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      color={alquiler.idPago ? "green" : "gray"}
                    >
                      {alquiler.idPago ? `Pagado (${alquiler.metodoPago})` : 'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Flex justifyContent="start" className="gap-2">
                      <Button
                        icon={Eye}
                        variant="light"
                        size="xs"
                        onClick={() => verDetalle(alquiler.idAlquiler)}
                      >
                        Ver
                      </Button>
                      <Button
                        icon={alquiler.estado ? XCircle : CheckCircle}
                        variant="light"
                        color={alquiler.estado ? "red" : "green"}
                        size="xs"
                        onClick={() => cambiarEstadoAlquiler(alquiler.idAlquiler, alquiler.estado)}
                        disabled={loading}
                      >
                        {alquiler.estado ? 'Finalizar' : 'Activar'}
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))}
              
              {alquileres.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No hay alquileres registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
      
      {/* Modal de detalle */}
      <Dialog open={modalDetalle} onClose={cerrarDetalle} static={true}>
        <DialogPanel className="max-w-4xl">
          {detalleAlquiler && (
            <>
              <Title className="mb-2">Detalle de alquiler #{detalleAlquiler.idAlquiler}</Title>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Text className="font-semibold">Cliente:</Text>
                  <Text>{detalleAlquiler.cliente} (DNI: {detalleAlquiler.clienteDni})</Text>
                </div>
                <div>
                  <Text className="font-semibold">Empleado:</Text>
                  <Text>{detalleAlquiler.empleado}</Text>
                </div>
                <div>
                  <Text className="font-semibold">Fecha inicio:</Text>
                  <Text>{detalleAlquiler.fechaInicio}</Text>
                </div>
                <div>
                  <Text className="font-semibold">Fecha fin:</Text>
                  <Text>{detalleAlquiler.fechaFin}</Text>
                </div>
                <div>
                  <Text className="font-semibold">Estado:</Text>
                  <Badge 
                    color={detalleAlquiler.estado ? "green" : "red"}
                    icon={detalleAlquiler.estado ? CheckCircle : XCircle}
                  >
                    {detalleAlquiler.estado ? 'Activo' : 'Finalizado'}
                  </Badge>
                </div>
              </div>
              
              <Title className="text-lg mb-2">Piezas alquiladas</Title>
              <Table className="mb-4">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Pieza</TableHeaderCell>
                    <TableHeaderCell>Cantidad</TableHeaderCell>
                    <TableHeaderCell>Precio unitario</TableHeaderCell>
                    <TableHeaderCell>Subtotal</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detalleAlquiler.detalles.map((detalle, index) => (
                    <TableRow key={detalle.idDetalleAlquiler || index}>
                      <TableCell>{detalle.pieza}</TableCell>
                      <TableCell>{detalle.cantidad}</TableCell>
                      <TableCell>S/ {detalle.precioUnitario.toFixed(2)}</TableCell>
                      <TableCell>S/ {detalle.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  
                  {detalleAlquiler.detalles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-2">
                        No hay detalles disponibles
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              <div className="flex justify-between items-center">
                <div>
                  <Text className="font-semibold text-lg">Total: S/ {detalleAlquiler.total.toFixed(2)}</Text>
                  {detalleAlquiler.idPago && (
                    <>
                      <Text className="text-sm">Método de pago: {detalleAlquiler.metodoPago}</Text>
                      <Text className="text-sm">Monto pagado: S/ {detalleAlquiler.montoPagado?.toFixed(2) || '0.00'}</Text>
                      {detalleAlquiler.vuelto && detalleAlquiler.vuelto.toFixed(2) !== '0.00' && (
                        <Text className="text-sm">Vuelto: S/ {detalleAlquiler.vuelto.toFixed(2)}</Text>
                      )}
                    </>
                  )}
                </div>
                <Button onClick={cerrarDetalle}>Cerrar</Button>
              </div>
            </>
          )}
        </DialogPanel>
      </Dialog>
    </div>
  );
};

export default ListaAlquileresPage;
