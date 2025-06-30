import React, { useState } from 'react';
import { Eye, EyeOff, AlertTriangle, Key } from 'react-feather';

const PasswordChangeForm = ({ onSubmit, loading, onClose }) => {
  const [form, setForm] = useState({
    contrasenaActual: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  });
  const [show, setShow] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [touched, setTouched] = useState({
    contrasenaActual: false,
    nuevaContrasena: false,
    confirmarContrasena: false
  });

  // Validación por campo
  const validate = (fields = form) => {
    const errs = {};
    if (!fields.contrasenaActual) errs.contrasenaActual = 'Ingrese su contraseña actual';
    if (!fields.nuevaContrasena) errs.nuevaContrasena = 'Ingrese una nueva contraseña';
    if (fields.nuevaContrasena && fields.nuevaContrasena === fields.contrasenaActual) {
      errs.nuevaContrasena = 'La nueva contraseña no puede ser igual a la actual';
    }
    if (!fields.confirmarContrasena) errs.confirmarContrasena = 'Confirme la nueva contraseña';
    if (
      fields.nuevaContrasena &&
      fields.confirmarContrasena &&
      fields.nuevaContrasena !== fields.confirmarContrasena
    ) {
      errs.confirmarContrasena = 'Las contraseñas no coinciden';
    }
    return errs;
  };

  // Validación en tiempo real por campo
  const handleChange = e => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validate(updatedForm));
    setBackendError('');
    setTriedSubmit(false);
  };

  const handleBlur = e => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validate(form));
  };

  const handleShow = (field) => {
    setShow(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setTriedSubmit(true);
    const errs = validate(form);
    setErrors(errs);
    setBackendError('');
    if (Object.keys(errs).length > 0) {
      return;
    }
    try {
      await onSubmit({
        contrasenaActual: form.contrasenaActual,
        nuevaContrasena: form.nuevaContrasena
      });
      setForm({ contrasenaActual: '', nuevaContrasena: '', confirmarContrasena: '' });
      setErrors({});
      setBackendError('');
      setTriedSubmit(false);
      setTouched({
        contrasenaActual: false,
        nuevaContrasena: false,
        confirmarContrasena: false
      });
      onClose(form.nuevaContrasena);
    } catch (err) {
      if (
        err.message &&
        (err.message.toLowerCase().includes('actual') ||
          err.message.toLowerCase().includes('incorrecta'))
      ) {
        setErrors(prev => ({
          ...prev,
          contrasenaActual: err.message
        }));
      } else {
        setBackendError(err.message || 'Error al cambiar la contraseña');
      }
    }
  };

  // Limpia los campos y errores, pero NO cierra el formulario
  const handleClean = () => {
    setForm({ contrasenaActual: '', nuevaContrasena: '', confirmarContrasena: '' });
    setErrors({});
    setBackendError('');
    setTriedSubmit(false);
    setTouched({
      contrasenaActual: false,
      nuevaContrasena: false,
      confirmarContrasena: false
    });
  };

  // Cierra el formulario (modal)
  const handleClose = () => {
    onClose();
  };

  // Mensaje general solo si intentó guardar y hay errores
  const showGeneralError = triedSubmit && Object.keys(errors).length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-100 animate-fade-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-700 transition text-2xl"
          title="Cerrar"
        >
          ×
        </button>
        <div className="flex items-center gap-3 mb-6">
          <Key size={28} className="text-red-700" />
          <h2 className="text-2xl font-bold text-gray-800">Cambiar Contraseña</h2>
        </div>
        {showGeneralError && (
          <div className="flex flex-col gap-1 text-red-700 bg-red-100/70 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} />
              <span className="font-semibold">No se puede guardar.</span>
            </div>
            <ul className="list-disc list-inside ml-6 mt-1 text-sm">
              {errors.contrasenaActual && (
                <li>
                  <span>Contraseña actual: </span>
                  {errors.contrasenaActual.toLowerCase().includes('incorrecta') ||
                  errors.contrasenaActual.toLowerCase().includes('inválida')
                    ? 'La contraseña actual ingresada no es válida.'
                    : errors.contrasenaActual}
                </li>
              )}
              {errors.nuevaContrasena && (
                <li>
                  <span>Nueva contraseña: </span>
                  {errors.nuevaContrasena}
                </li>
              )}
              {errors.confirmarContrasena && (
                <li>
                  <span>Confirmar nueva contraseña: </span>
                  {errors.confirmarContrasena}
                </li>
              )}
            </ul>
            <div className="text-xs mt-1">
              Revise y corrija los campos resaltados antes de volver a intentar.
            </div>
          </div>
        )}
        {backendError && (
          <div className="flex items-center gap-2 text-red-700 bg-red-100 border border-red-200 rounded-lg p-3 mb-2">
            <AlertTriangle size={18} />
            <div>{backendError}</div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-1 font-semibold">Contraseña actual</label>
            <div className="relative">
              <input
                type={show.actual ? 'text' : 'password'}
                name="contrasenaActual"
                value={form.contrasenaActual}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 border rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-red-700 pr-10 transition-all ${
                  errors.contrasenaActual && (touched.contrasenaActual || triedSubmit)
                    ? 'border-red-500'
                    : 'border-gray-200'
                }`}
                autoComplete="current-password"
              />
              <button type="button" className="absolute right-2 top-2 text-gray-500" tabIndex={-1} onClick={() => handleShow('actual')}>
                {show.actual ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.contrasenaActual && (touched.contrasenaActual || triedSubmit) && (
              <span className="text-xs text-red-500">{errors.contrasenaActual}</span>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-semibold">Nueva contraseña</label>
            <div className="relative">
              <input
                type={show.nueva ? 'text' : 'password'}
                name="nuevaContrasena"
                value={form.nuevaContrasena}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 border rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-red-700 pr-10 transition-all ${
                  errors.nuevaContrasena && (touched.nuevaContrasena || triedSubmit)
                    ? 'border-red-500'
                    : 'border-gray-200'
                }`}
                autoComplete="new-password"
              />
              <button type="button" className="absolute right-2 top-2 text-gray-500" tabIndex={-1} onClick={() => handleShow('nueva')}>
                {show.nueva ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.nuevaContrasena && (touched.nuevaContrasena || triedSubmit) && (
              <span className="text-xs text-red-500">{errors.nuevaContrasena}</span>
            )}
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-semibold">Confirmar nueva contraseña</label>
            <div className="relative">
              <input
                type={show.confirmar ? 'text' : 'password'}
                name="confirmarContrasena"
                value={form.confirmarContrasena}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 border rounded-lg bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-red-700 pr-10 transition-all ${
                  errors.confirmarContrasena && (touched.confirmarContrasena || triedSubmit)
                    ? 'border-red-500'
                    : 'border-gray-200'
                }`}
                autoComplete="new-password"
              />
              <button type="button" className="absolute right-2 top-2 text-gray-500" tabIndex={-1} onClick={() => handleShow('confirmar')}>
                {show.confirmar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmarContrasena && (touched.confirmarContrasena || triedSubmit) && (
              <span className="text-xs text-red-500">{errors.confirmarContrasena}</span>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition"
              onClick={handleClean}
              disabled={loading}
            >
              Limpiar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-semibold shadow transition"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeForm;