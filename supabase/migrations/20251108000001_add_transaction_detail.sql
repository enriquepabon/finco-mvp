-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migration: Agregar campo 'detail' a budget_transactions
-- Fecha: 2025-11-08
-- Descripción: 
--   - Agregar campo 'detail' para información adicional específica
--   - Esto permite tener un nivel más granular de información:
--     * description: Descripción general (ej: "Ingreso por préstamo")
--     * detail: Detalle específico editable (ej: "Préstamo de Juan - Cuota 1/3")
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Agregar columna 'detail' a budget_transactions
ALTER TABLE budget_transactions 
ADD COLUMN IF NOT EXISTS detail TEXT;

-- Crear índice para búsquedas de detalle
CREATE INDEX IF NOT EXISTS idx_budget_transactions_detail 
ON budget_transactions USING gin(to_tsvector('spanish', detail));

-- Comentario de la columna
COMMENT ON COLUMN budget_transactions.detail IS 'Detalle específico adicional de la transacción, editable por el usuario';

