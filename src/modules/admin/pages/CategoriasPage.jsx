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
  Badge,
  Flex
} from '@tremor/react';
import { Edit, Trash2, Search, PlusCircle, RefreshCw } from 'react-feather';
import { categoriaAPI } from '../services/CategoriaAPI';
import CategoriaModal from '../components/Categorias/CategoriaModal';

const CategoriasPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    estado: true
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriaAPI.listarCategorias();
      setCategorias(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las categorías');
      setLoading(false);
      console.error('Error:', err.message);
    }
  };
  
  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      const nuevoEstado = !estadoActual;
      const response = await categoriaAPI.cambiarEstadoCategoria(id, nuevoEstado);
      
      if (response) {
        // Actualiza el estado localmente con la respuesta del servidor
        setCategorias(categorias.map(cat => 
          cat.idCategoria === id ? {...cat, estado: response.estado} : cat
        ));
      }
    } catch (err) {
      console.error('Error al cambiar el estado de la categoría:', err.message);
      alert('Error al cambiar el estado de la categoría');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }
    
    try {
      await categoriaAPI.eliminarCategoria(id);
      
      // Elimina la categoría localmente después de la confirmación del servidor
      setCategorias(categorias.filter(cat => cat.idCategoria !== id));
    } catch (err) {
      console.error('Error al eliminar la categoría:', err.message);
      alert('Error al eliminar la categoría');
    }
  };
  
  const handleEdit = (categoria) => {
    setFormData({
      id: categoria.idCategoria,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      estado: categoria.estado
    });    setIsModalOpen(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida';
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

    try {
      if (formData.id) {
        // Actualizar categoría existente
        const categoriaData = {
          idCategoria: formData.id,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          estado: formData.estado
        };
        
        const response = await categoriaAPI.actualizarCategoria(categoriaData);
        
        if (response) {
          // Actualizar la lista con la respuesta del servidor
          setCategorias(categorias.map(cat => 
            cat.idCategoria === formData.id ? response : cat
          ));
          alert('Categoría actualizada exitosamente');
        }
      } else {
        // Crear nueva categoría
        const categoriaData = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          estado: formData.estado
        };
        
        const response = await categoriaAPI.guardarCategoria(categoriaData);
        
        if (response) {
          // Añadir la nueva categoría a la lista
          setCategorias([...categorias, response]);
          alert('Categoría creada exitosamente');
        }
      }
      
      resetForm();
    } catch (err) {
      console.error('Error al guardar la categoría', err);
      alert('Error al guardar la categoría');
    }
  };
    const resetForm = () => {
    setFormData({
      id: null,
      nombre: '',
      descripcion: '',
      estado: true
    });
    setFormErrors({});
    setIsModalOpen(false);
  };
  
  const filteredCategorias = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
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
          onClick={fetchCategorias}
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h1>
          <p className="text-gray-500">Administra las categorías de productos del gimnasio</p>
        </div>        <Button 
          icon={PlusCircle} 
          variant="primary"
          onClick={() => setIsModalOpen(true)}
        >
          Nueva Categoría
        </Button>
      </div>

      <CategoriaModal
        isOpen={isModalOpen}
        onClose={resetForm}
        formData={formData}
        formErrors={formErrors}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
      
      <Card>
        <Flex justifyContent="between" className="mb-4">
          <Title>Lista de Categorías</Title>
          <TextInput
            icon={Search}
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Flex>
        
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>Descripción</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategorias.length > 0 ? (
              filteredCategorias.map((categoria) => (
                <TableRow key={categoria.idCategoria}>
                  <TableCell>{categoria.nombre}</TableCell>
                  <TableCell>{categoria.descripcion}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleEstado(categoria.idCategoria, categoria.estado)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none ${
                        categoria.estado ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          categoria.estado ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-sm">
                      {categoria.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="xs"
                        variant="secondary"
                        icon={Edit}
                        onClick={() => handleEdit(categoria)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        color="red"
                        icon={Trash2}
                        onClick={() => handleDelete(categoria.idCategoria)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  {searchTerm ? 'No se encontraron categorías' : 'No hay categorías disponibles'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CategoriasPage;