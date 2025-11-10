'use client';

/**
 * Componente para mostrar la lista detallada de transacciones
 * Muestra el detalle específico de cada transacción en subcategorías
 * MentorIA - Sistema de Registro de Transacciones
 */

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, FileText, Calendar, DollarSign } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { Transaction } from '@/types/transaction';

interface TransactionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategoryId: string;
  subcategoryName: string;
  categoryName: string;
}

interface TransactionWithDetails extends Transaction {
  formatted_date?: string;
}

export default function TransactionListModal({
  isOpen,
  onClose,
  subcategoryId,
  subcategoryName,
  categoryName
}: TransactionListModalProps) {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (isOpen && subcategoryId) {
      loadTransactions();
    }
  }, [isOpen, subcategoryId]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('budget_transactions')
        .select('*')
        .eq('subcategory_id', subcategoryId)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error loading transactions:', error);
      } else {
        // Formatear fechas
        const formatted = data.map(t => ({
          ...t,
          formatted_date: new Date(t.transaction_date).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })
        }));
        setTransactions(formatted);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (transactionId: string) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedTransactions(newExpanded);
  };

  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{subcategoryName}</h2>
              <p className="text-purple-100 mt-1 text-sm">
                Categoría: {categoryName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Total */}
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm text-purple-100">Total</p>
            <p className="text-3xl font-bold">${totalAmount.toLocaleString('es-CO')}</p>
            <p className="text-sm text-purple-100 mt-1">
              {transactions.length} transacción{transactions.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 mt-2">Cargando transacciones...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay transacciones registradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => {
                const isExpanded = expandedTransactions.has(transaction.id);
                const hasDetail = !!transaction.detail;

                return (
                  <div
                    key={transaction.id || `transaction-${index}`}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 overflow-hidden"
                  >
                    {/* Main Row */}
                    <div
                      className="p-4 flex items-center gap-4 cursor-pointer hover:bg-purple-100/30 transition-colors"
                      onClick={() => hasDetail && toggleExpanded(transaction.id)}
                    >
                      {/* Icono expandir (solo si tiene detalle) */}
                      {hasDetail && (
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-purple-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                      )}

                      {/* Fecha */}
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {transaction.formatted_date}
                        </span>
                      </div>

                      {/* Descripción */}
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{transaction.description}</p>
                        {hasDetail && !isExpanded && (
                          <p className="text-sm text-gray-500 truncate">{transaction.detail}</p>
                        )}
                      </div>

                      {/* Monto */}
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className={`text-lg font-bold ${
                          transaction.transaction_type === 'income' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'expense' && '-'}
                          ${Number(transaction.amount).toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>

                    {/* Detalle expandido */}
                    {isExpanded && hasDetail && (
                      <div className="px-4 pb-4 border-t border-purple-200">
                        <div className="bg-white rounded-lg p-4 mt-2">
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                            Detalle Específico
                          </p>
                          <p className="text-gray-900">{transaction.detail}</p>
                          
                          {/* Info adicional si existe */}
                          {transaction.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                Notas
                              </p>
                              <p className="text-sm text-gray-700">{transaction.notes}</p>
                            </div>
                          )}

                          {transaction.location && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                                Ubicación
                              </p>
                              <p className="text-sm text-gray-700">{transaction.location}</p>
                            </div>
                          )}

                          {transaction.auto_categorized && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-purple-600">
                              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                              <span>Clasificado con IA ({transaction.confidence_score}% confianza)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

