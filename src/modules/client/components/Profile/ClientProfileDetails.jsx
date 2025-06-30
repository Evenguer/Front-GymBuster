import React, { useState } from 'react';
import {
  Key, Lock
} from 'react-feather';
import {
  FaUser, FaUserCheck, FaIdCard, FaEnvelope, FaMobileAlt, FaVenusMars, FaBirthdayCake, FaHourglassHalf
} from 'react-icons/fa';
import { TbGenderMale, TbGenderFemale, TbGenderBigender } from 'react-icons/tb';

const ClientProfileDetails = ({ profile, onShowPasswordForm }) => {
  // Simulación de contraseña (puedes traerla real si tu backend lo permite, aquí solo es ejemplo)
  const passwordMasked = profile?.password
    ? '•'.repeat(profile.password.length)
    : '••••••••';

  const genero = profile.genero?.toLowerCase();
  let genderIcon = null;
  if (genero === 'masculino') {
    genderIcon = (
      <TbGenderMale
        className="ml-3 text-blue-600 bg-blue-100 rounded-full p-1"
        size={32}
        title="Masculino"
      />
    );
  } else if (genero === 'femenino') {
    genderIcon = (
      <TbGenderFemale
        className="ml-3 text-pink-600 bg-pink-100 rounded-full p-1"
        size={32}
        title="Femenino"
      />
    );
  } else if (genero) {
    genderIcon = (
      <TbGenderBigender
        className="ml-3 text-purple-600 bg-purple-100 rounded-full p-1"
        size={32}
        title={profile.genero}
      />
    );
  }

  return (
    <div className="w-full min-h-[600px] flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl px-8 py-12 mb-12 border border-gray-100 flex flex-col items-center mx-auto">
        {/* Avatar, nombre de usuario y género centrados */}
        <div className="flex flex-col items-center mb-10 w-full">
          <div className="relative flex flex-col items-center w-full">
            <div className="w-36 h-36 rounded-full bg-red-100 flex items-center justify-center text-6xl font-extrabold text-red-700 border-4 border-white mb-4">
              {profile.nombre[0]}{profile.apellidos[0]}
            </div>
            {/* Nombre de usuario centrado y género al costado */}
            <div className="flex flex-row items-center justify-center mt-1">
              <span className="text-3xl font-bold text-gray-800">{profile.nombreUsuario}</span>
              {genderIcon}
            </div>
            {/* Contraseña visualización */}
            <div className="flex items-center gap-2 mt-6 bg-neutral-50 px-4 py-2 rounded-xl border border-gray-200">
              <Lock size={20} className="text-red-700" />
              <span className="font-mono tracking-widest text-lg select-all">
                {passwordMasked}
              </span>
              <button
                type="button"
                className="ml-2 px-3 py-1 rounded-lg bg-gradient-to-r from-red-700 to-red-800 text-white hover:from-red-800 hover:to-red-900 text-sm font-semibold shadow transition flex items-center gap-1"
                onClick={onShowPasswordForm}
                title="Cambiar contraseña"
              >
                <Key size={16} /> Cambiar
              </button>
            </div>
          </div>
        </div>
        {/* Datos */}
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-8 text-base bg-white rounded-2xl p-8 border border-gray-50">
            <div className="flex items-center gap-4 whitespace-nowrap justify-center md:justify-start">
              <FaUser className="text-red-700 flex-shrink-0" size={22} />
              <span><strong>Nombre:</strong> {profile.nombre}</span>
            </div>
            <div className="flex items-center gap-4 whitespace-nowrap justify-center md:justify-start">
              <FaUserCheck className="text-red-700 flex-shrink-0" size={22} />
              <span><strong>Apellidos:</strong> {profile.apellidos}</span>
            </div>
            <div className="flex items-center gap-4 whitespace-nowrap justify-center md:justify-start">
              <FaIdCard className="text-red-700 flex-shrink-0" size={22} />
              <span><strong>DNI:</strong> {profile.dni}</span>
            </div>
            <div className="flex items-center gap-4 whitespace-nowrap justify-center md:justify-start">
              <FaEnvelope className="text-red-700 flex-shrink-0" size={22} />
              <span><strong>Correo:</strong> {profile.correo}</span>
            </div>
            <div className="flex items-center gap-4 whitespace-nowrap justify-center md:justify-start">
              <FaMobileAlt className="text-red-700 flex-shrink-0" size={22} />
              <span><strong>Celular:</strong> {profile.celular}</span>
            </div>
            <div className="flex items-center gap-4 whitespace-nowrap justify-center md:justify-start">
              <FaVenusMars className="text-red-700 flex-shrink-0" size={22} />
              <span><strong>Género:</strong> {profile.genero || '-'}</span>
            </div>
            <div className="flex items-center gap-4 whitespace-nowrap justify-center md:justify-start">
              <FaBirthdayCake className="text-red-700 flex-shrink-0" size={22} />
              <span><strong>Fecha de nacimiento:</strong> {profile.fechaNacimiento || '-'}</span>
            </div>
            <div className="flex items-center gap-4 whitespace-nowrap justify-center md:justify-start">
              <FaHourglassHalf className="text-red-700 flex-shrink-0" size={22} />
              <span><strong>Edad:</strong> {profile.edad || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfileDetails;