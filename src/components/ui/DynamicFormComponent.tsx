'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';

// Tipos para los datos estructurados
export interface FormEntry {
  id: string;
  [key: string]: string | number;
}

export interface StructuredData {
  type: string;
  entries: FormEntry[];
}

interface Column {
  key: string;
  label: string;
  type: 'text' | 'number';
  placeholder?: string;
}

interface FormLayout {
  columns: Column[];
  minRows: number;
  maxRows: number;
  addButtonText: string;
}

// Layouts predefinidos por tipo de pregunta - UNIFICADOS A 3 COLUMNAS
const FORM_LAYOUTS: Record<string, FormLayout> = {
  income: {
    columns: [
      { key: 'category', label: 'Categoría', type: 'text', placeholder: 'Ej: Trabajo, Negocio, Inversiones' },
      { key: 'subcategory', label: 'Subcategoría', type: 'text', placeholder: 'Ej: Salario, Rentas, Freelance' },
      { key: 'amount', label: 'Monto en Pesos', type: 'number', placeholder: '0' }
    ],
    minRows: 2,
    maxRows: 8,
    addButtonText: 'Agregar Ingreso'
  },
  fixed_expenses: {
    columns: [
      { key: 'category', label: 'Categoría', type: 'text', placeholder: 'Ej: Vivienda, Transporte, Servicios' },
      { key: 'subcategory', label: 'Subcategoría', type: 'text', placeholder: 'Ej: Arriendo, Gasolina, Luz' },
      { key: 'amount', label: 'Monto en Pesos', type: 'number', placeholder: '0' }
    ],
    minRows: 3,
    maxRows: 10,
    addButtonText: 'Agregar Gasto Fijo'
  },
  variable_expenses: {
    columns: [
      { key: 'category', label: 'Categoría', type: 'text', placeholder: 'Ej: Alimentación, Entretenimiento' },
      { key: 'subcategory', label: 'Subcategoría', type: 'text', placeholder: 'Ej: Mercado, Restaurantes, Cine' },
      { key: 'amount', label: 'Monto en Pesos', type: 'number', placeholder: '0' }
    ],
    minRows: 4,
    maxRows: 12,
    addButtonText: 'Agregar Gasto Variable'
  },
  savings: {
    columns: [
      { key: 'category', label: 'Categoría', type: 'text', placeholder: 'Ej: Ahorro, Inversión, Meta' },
      { key: 'subcategory', label: 'Subcategoría', type: 'text', placeholder: 'Ej: Emergencia, Vacaciones, Casa' },
      { key: 'amount', label: 'Monto en Pesos', type: 'number', placeholder: '0' }
    ],
    minRows: 2,
    maxRows: 5,
    addButtonText: 'Agregar Ahorro'
  }
};

interface Props {
  questionType: string;
  onDataChange: (data: StructuredData) => void;
  onSubmit: (data: StructuredData) => void;
  isLoading?: boolean;
}

export default function DynamicFormComponent({ questionType, onDataChange, onSubmit, isLoading = false }: Props) {
  const layout = FORM_LAYOUTS[questionType];
  
  if (!layout) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Tipo de formulario no soportado: {questionType}</p>
      </div>
    );
  }

  // Inicializar con filas mínimas
  const createEmptyEntry = (): FormEntry => ({
    id: Date.now().toString() + Math.random(),
    ...layout.columns.reduce((acc, col) => ({ ...acc, [col.key]: col.type === 'number' ? 0 : '' }), {})
  });

  const [entries, setEntries] = useState<FormEntry[]>(() => 
    Array.from({ length: layout.minRows }, () => createEmptyEntry())
  );

  // Notificar cambios al componente padre usando useCallback para evitar bucles
  const notifyDataChange = useCallback(() => {
    const structuredData: StructuredData = {
      type: questionType,
      entries: entries.filter(entry => 
        layout.columns.some(col => 
          col.type === 'number' ? Number(entry[col.key]) > 0 : String(entry[col.key]).trim() !== ''
        )
      )
    };
    onDataChange(structuredData);
  }, [entries, questionType, onDataChange]);

  useEffect(() => {
    notifyDataChange();
  }, [notifyDataChange]);

  const updateEntry = (id: string, key: string, value: string | number) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, [key]: value } : entry
    ));
  };

  const addEntry = () => {
    if (entries.length < layout.maxRows) {
      setEntries(prev => [...prev, createEmptyEntry()]);
    }
  };

  const removeEntry = (id: string) => {
    if (entries.length > layout.minRows) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleSubmit = () => {
    const structuredData: StructuredData = {
      type: questionType,
      entries: entries.filter(entry => 
        layout.columns.some(col => 
          col.type === 'number' ? Number(entry[col.key]) > 0 : String(entry[col.key]).trim() !== ''
        )
      )
    };
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

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Información Estructurada
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Completa la información en el formato solicitado. Puedes agregar o quitar filas según necesites.
        </p>
      </div>

      {/* Tabla estructurada */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {layout.columns.map((column, index) => (
                <th 
                  key={column.key}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border border-gray-200 w-16">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, rowIndex) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                {layout.columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 border border-gray-200">
                    <input
                      type={column.type}
                      value={entry[column.key]}
                      placeholder={column.placeholder}
                      onChange={(e) => updateEntry(
                        entry.id, 
                        column.key, 
                        column.type === 'number' ? Number(e.target.value) || 0 : e.target.value
                      )}
                      className="w-full px-3 py-2 text-sm text-gray-900 font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-gray-400"
                      min={column.type === 'number' ? '0' : undefined}
                      step={column.type === 'number' ? '1000' : undefined}
                    />
                    {/* Mostrar formato de moneda para campos numéricos */}
                    {column.type === 'number' && Number(entry[column.key]) > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formatNumber(Number(entry[column.key]))}
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 border border-gray-200 text-center">
                  <button
                    onClick={() => removeEntry(entry.id)}
                    disabled={entries.length <= layout.minRows}
                    className={`p-1 rounded-md transition-colors ${
                      entries.length <= layout.minRows
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

      {/* Botones de acción */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={addEntry}
          disabled={entries.length >= layout.maxRows}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            entries.length >= layout.maxRows
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          {layout.addButtonText}
        </button>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {entries.filter(entry => 
              layout.columns.some(col => 
                col.type === 'number' ? Number(entry[col.key]) > 0 : String(entry[col.key]).trim() !== ''
              )
            ).length} elementos completados
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || entries.filter(entry => 
              layout.columns.some(col => 
                col.type === 'number' ? Number(entry[col.key]) > 0 : String(entry[col.key]).trim() !== ''
              )
            ).length === 0}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
              isLoading || entries.filter(entry => 
                layout.columns.some(col => 
                  col.type === 'number' ? Number(entry[col.key]) > 0 : String(entry[col.key]).trim() !== ''
                )
              ).length === 0
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