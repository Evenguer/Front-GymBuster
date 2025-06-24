import React, { useState, useEffect } from 'react';
import { 
  Card, 
  TextInput,
  Title,
  Flex,
  Grid
} from '@tremor/react';
import { Search, RefreshCw, Tag, Check, XOctagon } from 'react-feather';
import { categoriaAPI } from '../../../admin/services/CategoriaAPI';

const CategoriaPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriaAPI.listarCategorias();
      setCategorias(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las categorías');
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCategorias();
  }, []);
  // La función de cambio de estado se ha eliminado ya que solo se muestra el estado

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <p className="text-gray-500">Lista de categorías</p>
      </div>      <Card>
        <Flex justifyContent="between" className="mb-6">
          <Title>Lista de Categorías</Title>
          <TextInput
            icon={Search}
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Flex>
        
        {filteredCategorias.length > 0 ? (          <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
            {filteredCategorias.map((categoria) => (
              <Card 
                key={categoria.idCategoria}
                className={`transition-all duration-300 ${
                  categoria.estado 
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 opacity-75'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      categoria.estado 
                        ? 'bg-green-100' 
                        : 'bg-gray-100'
                    }`}>
                      <Tag size={20} className={`${
                        categoria.estado 
                          ? 'text-green-600' 
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${
                        categoria.estado ? 'text-green-900' : 'text-gray-700'
                      }`}>
                        {categoria.nombre}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        categoria.estado ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {categoria.descripcion}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {categoria.estado ? (
                      <>
                        <Check size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-800 bg-green-100 px-2 py-1 rounded-full">
                          Categoría Activa
                        </span>
                      </>
                    ) : (
                      <>
                        <XOctagon size={16} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-full">
                          Categoría Descontinuada
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron categorías' : 'No hay categorías disponibles'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CategoriaPage;
