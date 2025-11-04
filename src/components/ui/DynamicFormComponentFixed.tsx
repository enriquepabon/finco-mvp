'use client';

import React, { useState } from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';

// Tipos para los datos estructurados
export interface FormEntry {
  id: string;
  category: string;
  subcategory: string;
  amount: number;
}

export interface StructuredData {
  type: string;
  entries: FormEntry[];
}

interface Props {
  questionType: string;
  onSubmit: (data: StructuredData) => void;
  isLoading?: boolean;
}

// Categorías y subcategorías precargadas
const PREDEFINED_DATA = {
  income: {
    title: '💰 Ingresos Mensuales',
    categories: ['Trabajo', 'Negocio', 'Inversiones', 'Rentas', 'Freelance', 'Otros'],
    subcategories: {
      'Trabajo': ['Salario', 'Bonos', 'Comisiones', 'Horas extra'],
      'Negocio': ['Ventas', 'Servicios', 'Productos', 'Consultoría'],
      'Inversiones': ['Dividendos', 'Intereses', 'Ganancias capital'],
      'Rentas': ['Inmuebles', 'Vehículos', 'Equipos'],
      'Freelance': ['Proyectos', 'Servicios', 'Consultoría'],
      'Otros': ['Regalos', 'Premios', 'Varios']
    }
  },
  fixed_expenses: {
    title: '🏠 Gastos Fijos Mensuales',
    categories: ['Vivienda', 'Transporte', 'Servicios', 'Seguros', 'Suscripciones', 'Bienestar', 'Otros'],
    subcategories: {
      'Vivienda': ['Arriendo', 'Administración', 'Hipoteca', 'Impuestos'],
      'Transporte': ['Gasolina', 'Mantenimiento', 'Seguro vehículo', 'Parqueadero'],
      'Servicios': ['Luz', 'Agua', 'Gas', 'Internet', 'Teléfono'],
      'Seguros': ['Vida', 'Salud', 'Hogar', 'Vehículo'],
      'Suscripciones': ['Netflix', 'Spotify', 'Gimnasio', 'Software'],
      'Bienestar': ['Gimnasio', 'Peluquería', 'Spa', 'Deportes'],
      'Otros': ['Préstamos', 'Tarjetas', 'Varios']
    }
  },
  variable_expenses: {
    title: '🛒 Gastos Variables Mensuales',
    categories: ['Alimentación', 'Entretenimiento', 'Ropa', 'Salud', 'Educación', 'Transporte', 'Otros'],
    subcategories: {
      'Alimentación': ['Mercado', 'Restaurantes', 'Domicilios', 'Snacks'],
      'Entretenimiento': ['Cine', 'Conciertos', 'Salidas', 'Hobbies'],
      'Ropa': ['Vestimenta', 'Calzado', 'Accesorios'],
      'Salud': ['Medicina', 'Doctor', 'Exámenes', 'Terapias'],
      'Educación': ['Cursos', 'Libros', 'Materiales'],
      'Transporte': ['Taxi', 'Uber', 'Bus', 'Viajes'],
      'Otros': ['Regalos', 'Imprevistos', 'Varios']
    }
  },
  savings: {
    title: '💾 Ahorros y Metas (Regla 20-30-50)',
    categories: ['Emergencia', 'Metas', 'Inversiones', 'Jubilación', 'Otros'],
    subcategories: {
      'Emergencia': ['Fondo 6 meses', 'Imprevistos', 'Salud'],
      'Metas': ['Vacaciones', 'Casa', 'Carro', 'Educación'],
      'Inversiones': ['Acciones', 'Bonos', 'Fondos', 'Cripto'],
      'Jubilación': ['Pensión', 'AFP', 'Ahorro personal'],
      'Otros': ['Varios', 'Proyectos']
    }
  }
};

export default function DynamicFormComponentFixed({ questionType, onSubmit, isLoading = false }: Props) {
  const formData = PREDEFINED_DATA[questionType as keyof typeof PREDEFINED_DATA];
  
  if (!formData) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Tipo de formulario no soportado: {questionType}</p>
      </div>
    );
  }

  // Crear entradas vacías iniciales
  const createEmptyEntry = (): FormEntry => ({
    id: Date.now().toString() + Math.random(),
    category: '',
    subcategory: '',
    amount: 0
  });

  const [entries, setEntries] = useState<FormEntry[]>(() => 
    Array.from({ length: Math.min(formData.categories.length, 3) }, () => createEmptyEntry())
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const updateEntry = (id: string, field: keyof FormEntry, value: string | number) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addEntry = () => {
    if (entries.length < 12) { // Máximo 12 filas
      setEntries(prev => [...prev, createEmptyEntry()]);
    }
  };

  const removeEntry = (id: string) => {
    if (entries.length > 2) { // Mínimo 2 filas
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleSubmit = () => {
    // Validación más flexible - solo requiere categoría Y monto
    const validEntries = entries.filter(entry => 
      entry.category.trim() !== '' && entry.amount > 0
    );
    
    if (validEntries.length === 0) {
      alert('Por favor completa al menos una entrada con categoría y monto mayor a 0.');
      return;
    }

    const structuredData: StructuredData = {
      type: questionType,
      entries: validEntries
    };
    
    console.log('✅ Enviando datos estructurados:', structuredData);
    onSubmit(structuredData);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Contar entradas válidas (solo categoría y monto requeridos)
  const validEntries = entries.filter(entry => 
    entry.category.trim() !== '' && entry.amount > 0
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header con título dinámico */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            {formData.title}
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Organiza tu información financiera. Usa las categorías sugeridas o agrega las tuyas.
        </p>
      </div>

      {/* Tabla con categorías precargadas */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200">
                Categoría
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200">
                Subcategoría <span className="text-gray-400 font-normal">(Opcional)</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200">
                Monto en Pesos
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border border-gray-200 w-16">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 border border-gray-200">
                  <input
                    type="text"
                    list={`categories-${questionType}`}
                    value={entry.category}
                    placeholder="Selecciona o escribe categoría"
                    onChange={(e) => {
                      updateEntry(entry.id, 'category', e.target.value);
                      setSelectedCategory(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm text-gray-900 font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-gray-400"
                  />
                  <datalist id={`categories-${questionType}`}>
                    {formData.categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <input
                    type="text"
                    list={`subcategories-${entry.category}`}
                    value={entry.subcategory}
                    placeholder="Opcional - selecciona subcategoría"
                    onChange={(e) => updateEntry(entry.id, 'subcategory', e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-900 font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-gray-400"
                  />
                  {entry.category && formData.subcategories[entry.category as keyof typeof formData.subcategories] && (
                    <datalist id={`subcategories-${entry.category}`}>
                      {formData.subcategories[entry.category as keyof typeof formData.subcategories].map((subcat: string) => (
                        <option key={subcat} value={subcat} />
                      ))}
                    </datalist>
                  )}
                </td>
                <td className="px-4 py-3 border border-gray-200">
                  <input
                    type="number"
                    value={entry.amount}
                    placeholder="0"
                    onChange={(e) => updateEntry(entry.id, 'amount', Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-gray-900 font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-gray-400"
                    min="0"
                    step="1000"
                  />
                  {entry.amount > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatNumber(entry.amount)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 border border-gray-200 text-center">
                  <button
                    onClick={() => removeEntry(entry.id)}
                    disabled={entries.length <= 2}
                    className={`p-1 rounded-md transition-colors ${
                      entries.length <= 2
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                    }`}
                    title="Eliminar fila"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Controles */}
      <div className="flex justify-between items-center">
        <button
          onClick={addEntry}
          disabled={entries.length >= 12}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            entries.length >= 12
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          Agregar fila
        </button>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {validEntries.length} elementos completados
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || validEntries.length === 0}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
              isLoading || validEntries.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Enviando...' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
} 