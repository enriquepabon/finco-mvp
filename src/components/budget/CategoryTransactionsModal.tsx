'use client';

/**
 * Modal para ver y gestionar transacciones de una categoría específica
 * Permite ver todas las transacciones y eliminarlas individualmente
 */

import { useState, useEffect } from 'react';
import { X, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface Transaction {
  id: string;
  description: string;
  detail: string | null;
  amount: number;
  transaction_date: string;
  created_at: string;
}

interface CategoryTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  subcategoryName?: string;
  onTransactionDeleted?: () => void;
}

export default function CategoryTransactionsModal({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  subcategoryName,
  onTransactionDeleted
}: CategoryTransactionsModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (isOpen && categoryId) {
      loadTransactions();
    }
  }, [isOpen, categoryId]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('id, description, detail, amount, transaction_date, created_at')
        .eq('category_id', categoryId)
        .order('transaction_date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTransactions(data || []);
      console.log('✅ Transacciones cargadas:', data?.length || 0);

    } catch (err) {
      console.error('❌ Error cargando transacciones:', err);
      setError('Error al cargar las transacciones. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta transacción? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeletingId(transactionId);
      setError('');
      setSuccessMessage('');

      console.log('🗑️ Eliminando transacción:', transactionId);

      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la transacción');
      }

      console.log('✅ Transacción eliminada exitosamente');

      // Actualizar la lista local
      setTransactions(prev => prev.filter(t => t.id !== transactionId));

      // Mostrar mensaje de éxito
      setSuccessMessage('Transacción eliminada exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Notificar al componente padre para actualizar totales
      if (onTransactionDeleted) {
        onTransactionDeleted();
      }

    } catch (err) {
      console.error('❌ Error eliminando transacción:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Transacciones</h2>
              <p className="text-purple-100 mt-1">
                {categoryName}
                {subcategoryName && (
                  <span className="ml-2">→ {subcategoryName}</span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-4">Cargando transacciones...</p>
            </div>
          ) : transactions.length === 0 ? (
            /* Empty state */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay transacciones
              </h3>
              <p className="text-gray-500">
                Aún no se han registrado transacciones en esta categoría.
              </p>
            </div>
          ) : (
            /* Transactions list */
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Transaction info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {transaction.description}
                        </h4>
                        <span className="text-lg font-bold text-gray-900 flex-shrink-0">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>

                      {transaction.detail && (
                        <p className="text-sm text-gray-600 mb-2">
                          {transaction.detail}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📅 {formatDate(transaction.transaction_date)}</span>
                        <span>🕐 Registrado: {formatDate(transaction.created_at)}</span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      disabled={deletingId === transaction.id}
                      className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Eliminar transacción"
                    >
                      {deletingId === transaction.id ? (
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold">{transactions.length}</span> transacciones
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

