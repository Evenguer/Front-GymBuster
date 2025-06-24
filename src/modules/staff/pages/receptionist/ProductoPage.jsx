import React, { useState, useEffect } from 'react';
import { 
  Card,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Button,
  TextInput,
  Title,
  Flex,
  Text
} from '@tremor/react';
import { Edit, Trash2, Search, PlusCircle, RefreshCw } from 'react-feather';
import { productosAPI } from '../../../staff/services/productosAPI';
import { categoriaAPI } from '../../../admin/services/CategoriaAPI';
import ProductoModal from '../../components/receptionist/ProductoModal';

const ProductoPage = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await productosAPI.listarProductos();
      setProductos(response);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await categoriaAPI.listarCategorias();
      if (Array.isArray(response)) {
        setCategorias(response.filter(cat => cat.estado)); // Solo mostrar categorías activas
      } else {
        setError('Error al cargar las categorías: formato de respuesta inválido');
        setCategorias([]);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('Error al cargar las categorías. Por favor, intenta nuevamente.');
      setCategorias([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProductos(), fetchCategorias()]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      const response = await productosAPI.cambiarEstadoProducto(id, !estadoActual);
      if (response) {
        setProductos(productos.map(prod => 
          prod.idProducto === id ? {...prod, estado: !estadoActual} : prod
        ));
      }
    } catch (err) {
      console.error('Error al cambiar el estado del producto:', err);
      if (err.message === 'No tienes permisos para realizar esta acción') {
        alert('No tienes permisos para cambiar el estado del producto');
      } else {
        alert('Error al cambiar el estado del producto. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }
    
    try {
      await productosAPI.eliminarProducto(id);
      setProductos(productos.filter(prod => prod.idProducto !== id));
    } catch (err) {
      console.error('Error al eliminar el producto:', err.message);
      alert('Error al eliminar el producto');
    }
  };

  const handleEdit = (producto) => {
    setSelectedProduct(producto);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleProductSuccess = (updatedProducto) => {
    if (selectedProduct) {
      // Actualizar producto existente
      setProductos(productos.map(prod => 
        prod.idProducto === updatedProducto.idProducto ? updatedProducto : prod
      ));
    } else {
      // Agregar nuevo producto
      setProductos([...productos, updatedProducto]);
    }
    // Cerrar el modal después de actualizar los datos
    handleCloseModal();
  };

  const filteredProductos = productos.filter(prod =>
    prod.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <button 
          onClick={fetchProductos}
          className="mt-2 flex items-center text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded"
        >
          <RefreshCw size={14} className="mr-1" /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-500">Administra los productos del gimnasio</p>
        </div>
        <Button 
          icon={PlusCircle} 
          size="sm" 
          variant="primary" 
          onClick={handleOpenModal}
        >
          Nuevo Producto
        </Button>
      </div>
      
      <Card>
        <Flex justifyContent="between" className="mb-4">
          <Title>Lista de Productos</Title>
          <div className="w-64">
            <TextInput
              icon={Search}
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Flex>
        
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>Categoría</TableHeaderCell>
              <TableHeaderCell>Precio Venta</TableHeaderCell>
              <TableHeaderCell>Stock</TableHeaderCell>
              <TableHeaderCell>Fecha Vencimiento</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProductos.length > 0 ? (
              filteredProductos.map((producto) => (
                <TableRow key={producto.idProducto}>
                  <TableCell className="font-medium">{producto.nombre}</TableCell>
                  <TableCell>{producto.categoria.nombre}</TableCell>
                  <TableCell>S/ {producto.precioVenta}</TableCell>
                  <TableCell>
                    <span className={producto.stockTotal <= producto.stockMinimo ? 'text-red-600' : ''}>
                      {producto.stockTotal}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(producto.fechaVencimiento).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleEstado(producto.idProducto, producto.estado)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        producto.estado ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          producto.estado ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-xs">
                      {producto.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(producto)}
                        className="p-1.5 bg-amber-100 text-amber-600 rounded hover:bg-amber-200"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(producto.idProducto)}
                        className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <ProductoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        producto={selectedProduct}
        categorias={categorias}
        onSuccess={handleProductSuccess}
      />
    </div>
  );
};

export default ProductoPage;