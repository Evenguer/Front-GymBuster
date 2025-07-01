import React from 'react';
import { Eye, Edit, Trash2 } from 'react-feather';

export const ActionButtons = ({ onView, onEdit, onDelete, showView = true, showEdit = true, showDelete = true, hideText = false }) => {
  return (
    <div className="flex space-x-2 justify-start items-center">
      {showView && (
        <button
          className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium
                   text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200
                   transition-colors duration-200"
          onClick={onView}
          title="Ver detalles"
        >
          <Eye className="w-4 h-4 mr-1" />
          {!hideText && 'Ver'}
        </button>
      )}

      {showEdit && (
        <button
          className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium
                   text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200
                   transition-colors duration-200"
          onClick={onEdit}
          title="Editar"
        >
          <Edit className="w-4 h-4 mr-1" />
          {!hideText && 'Editar'}
        </button>
      )}

      {showDelete && (
        <button
          className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium
                   text-red-600 bg-red-50 hover:bg-red-100 border border-red-200
                   transition-colors duration-200"
          onClick={onDelete}
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          {!hideText && 'Eliminar'}
        </button>
      )}
    </div>
  );
};
