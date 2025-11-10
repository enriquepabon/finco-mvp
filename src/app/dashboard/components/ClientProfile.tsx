'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User, Edit3, Save, X, Baby, Heart, Calendar } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  age?: number;
  civil_status?: string;
  children_count?: number;
  monthly_income?: number;
  monthly_expenses?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_savings?: number;
  onboarding_completed: boolean;
}

interface ClientProfileProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  compact?: boolean;
}

const civilStatusMap: Record<string, string> = {
  'soltero': 'Soltero(a)',
  'casado': 'Casado(a)',
  'union_libre': 'Unión Libre',
  'divorciado': 'Divorciado(a)',
  'viudo': 'Viudo(a)'
};

export default function ClientProfile({ profile, onUpdate, compact = false }: ClientProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: profile.full_name || '',
    age: profile.age || 0,
    civil_status: profile.civil_status || '',
    children_count: profile.children_count || 0
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(editData)
        .eq('user_id', profile.user_id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      setIsEditing(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error actualizando perfil:', errorMessage);
      alert('Error al actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      full_name: profile.full_name || '',
      age: profile.age || 0,
      civil_status: profile.civil_status || '',
      children_count: profile.children_count || 0
    });
    setIsEditing(false);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${compact ? 'p-6' : 'p-8'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Perfil Personal</h3>
            {compact && <p className="text-sm text-gray-500">Información básica</p>}
          </div>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Editar perfil"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-3 h-3" />
              <span>{saving ? 'Guardando...' : 'Guardar'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Cancelar</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.full_name}
              onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu nombre completo"
            />
          ) : (
            <p className="text-gray-900 font-medium">{profile.full_name || 'No especificado'}</p>
          )}
        </div>

        {/* Edad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Edad
          </label>
          {isEditing ? (
            <input
              type="number"
              value={editData.age}
              onChange={(e) => setEditData({ ...editData, age: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu edad"
              min="18"
              max="100"
            />
          ) : (
            <p className="text-gray-900">{profile.age ? `${profile.age} años` : 'No especificado'}</p>
          )}
        </div>

        {/* Estado Civil */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Heart className="w-4 h-4 inline mr-1" />
            Estado Civil
          </label>
          {isEditing ? (
            <select
              value={editData.civil_status}
              onChange={(e) => setEditData({ ...editData, civil_status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              <option value="soltero">Soltero(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="union_libre">Unión Libre</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="viudo">Viudo(a)</option>
            </select>
          ) : (
            <p className="text-gray-900">
              {profile.civil_status ? civilStatusMap[profile.civil_status] : 'No especificado'}
            </p>
          )}
        </div>

        {/* Hijos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Baby className="w-4 h-4 inline mr-1" />
            Hijos
          </label>
          {isEditing ? (
            <input
              type="number"
              value={editData.children_count}
              onChange={(e) => setEditData({ ...editData, children_count: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Número de hijos"
              min="0"
              max="20"
            />
          ) : (
            <p className="text-gray-900">
              {profile.children_count === 0 ? 'No tiene hijos' : 
               profile.children_count === 1 ? '1 hijo' : 
               `${profile.children_count} hijos`}
            </p>
          )}
        </div>
      </div>

      {!compact && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Perfil actualizado automáticamente</span>
          </div>
        </div>
      )}
    </div>
  );
} 