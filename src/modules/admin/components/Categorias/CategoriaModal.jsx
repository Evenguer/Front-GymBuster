import React from 'react';
import { 
  Card,
  TextInput,
  Button,
  Title,
} from '@tremor/react';
import { X } from 'react-feather';

const CategoriaModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  formErrors, 
  handleInputChange, 
  handleSubmit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <Title>{formData.id ? 'Editar Categoría' : 'Nueva Categoría'}</Title>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <TextInput
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Nombre de la categoría"
                className={formErrors.nombre ? 'border-red-500' : ''}
              />
              {formErrors.nombre && (
                <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <TextInput
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción de la categoría"
                className={formErrors.descripcion ? 'border-red-500' : ''}
              />
              {formErrors.descripcion && (
                <p className="text-red-500 text-xs mt-1">{formErrors.descripcion}</p>
              )}
            </div>
            
            <div className="flex gap-2 justify-end mt-6">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {formData.id ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CategoriaModal;
