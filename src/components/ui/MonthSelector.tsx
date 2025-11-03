'use client';

import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
  className?: string;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function MonthSelector({ 
  selectedMonth, 
  selectedYear, 
  onMonthChange, 
  className = '' 
}: MonthSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i); // Año actual + 2 años más

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onMonthChange(parseInt(e.target.value), selectedYear);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onMonthChange(selectedMonth, parseInt(e.target.value));
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Presupuesto para:</span>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Selector de Mes */}
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors"
          >
            {MONTHS.map((month, index) => (
              <option key={index + 1} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Selector de Año */}
        <div className="relative">
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Indicador visual */}
      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
        {MONTHS[selectedMonth - 1]} {selectedYear}
      </div>
    </div>
  );
} 