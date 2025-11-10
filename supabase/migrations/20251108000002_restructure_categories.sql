-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migration: Restructurar sistema de categorías
-- Fecha: 2025-11-08
-- Descripción: 
--   - Cambiar category_type de 3 valores a: 'income', 'expense', 'savings'
--   - Agregar expense_type: 'fixed' o 'variable' (solo para gastos)
--   - Usar is_essential para clasificar gastos (ya existe, solo actualizar)
--   - Migrar datos existentes a nueva estructura
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PASO 1: Agregar nueva columna expense_type
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE budget_categories 
ADD COLUMN IF NOT EXISTS expense_type TEXT 
CHECK (expense_type IN ('fixed', 'variable') OR expense_type IS NULL);

COMMENT ON COLUMN budget_categories.expense_type IS 
'Tipo de gasto: fixed (fijo) o variable. Solo aplica cuando category_type = expense';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PASO 2: Actualizar el CHECK constraint de category_type PRIMERO
--         (Antes de cambiar los datos, para permitir 'savings')
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 2.1: Eliminar constraint antiguo
ALTER TABLE budget_categories 
DROP CONSTRAINT IF EXISTS budget_categories_category_type_check;

-- 2.2: Agregar nuevo constraint con 3 valores: income, expense, savings
ALTER TABLE budget_categories
ADD CONSTRAINT budget_categories_category_type_check 
CHECK (category_type IN ('income', 'expense', 'savings', 'fixed_expense', 'variable_expense'));
-- 👆 Temporalmente permitimos los valores antiguos para la transición

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PASO 3: Actualizar categorías existentes según su category_type
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 3.1: Categorías tipo 'fixed_expense' → asignar expense_type='fixed'
UPDATE budget_categories
SET expense_type = 'fixed'
WHERE category_type = 'fixed_expense';

-- 3.2: Categorías tipo 'variable_expense' → asignar expense_type='variable'
UPDATE budget_categories
SET expense_type = 'variable'
WHERE category_type = 'variable_expense';

-- 3.3: Identificar categorías de "Ahorros" y cambiarlas a category_type='savings'
--      (Buscamos por nombre común: Ahorros, Ahorro, Inversión, etc.)
UPDATE budget_categories
SET category_type = 'savings',
    expense_type = NULL,
    is_essential = NULL
WHERE LOWER(name) IN ('ahorros', 'ahorro', 'savings', 'inversiones', 'inversion')
   OR (category_type = 'fixed_expense' AND LOWER(name) LIKE '%ahorr%');

-- 3.4: Ahora unificar todos los gastos bajo 'expense'
UPDATE budget_categories
SET category_type = 'expense'
WHERE category_type IN ('fixed_expense', 'variable_expense');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PASO 4: Actualizar el CHECK constraint para valores finales
--         (Ahora solo permitimos: income, expense, savings)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 4.1: Eliminar constraint temporal
ALTER TABLE budget_categories 
DROP CONSTRAINT IF EXISTS budget_categories_category_type_check;

-- 4.2: Agregar constraint final (solo 3 valores)
ALTER TABLE budget_categories
ADD CONSTRAINT budget_categories_category_type_check 
CHECK (category_type IN ('income', 'expense', 'savings'));

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PASO 5: Establecer valores por defecto para is_essential en gastos
--         (ANTES de agregar constraints que lo validen)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 5.1: Limpiar is_essential para ingresos y ahorros (debe ser NULL)
UPDATE budget_categories
SET is_essential = NULL
WHERE category_type IN ('income', 'savings');

-- 5.2: Establecer is_essential en TRUE para gastos fijos (si aún no tiene valor)
UPDATE budget_categories
SET is_essential = TRUE
WHERE category_type = 'expense'
  AND expense_type = 'fixed'
  AND is_essential IS NULL;

-- 5.3: Establecer is_essential en FALSE para gastos variables (si aún no tiene valor)
UPDATE budget_categories
SET is_essential = FALSE
WHERE category_type = 'expense'
  AND expense_type = 'variable'
  AND is_essential IS NULL;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PASO 6: Agregar constraints para asegurar integridad
--         (DESPUÉS de limpiar y establecer valores correctos)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 6.1: expense_type debe ser NULL para ingresos y ahorros
ALTER TABLE budget_categories
ADD CONSTRAINT budget_categories_expense_type_constraint
CHECK (
  (category_type = 'expense' AND expense_type IN ('fixed', 'variable'))
  OR 
  (category_type IN ('income', 'savings') AND expense_type IS NULL)
);

-- 6.2: is_essential debe ser NULL para ingresos y ahorros
ALTER TABLE budget_categories
DROP CONSTRAINT IF EXISTS budget_categories_is_essential_constraint;

ALTER TABLE budget_categories
ADD CONSTRAINT budget_categories_is_essential_constraint
CHECK (
  (category_type = 'expense' AND is_essential IS NOT NULL)
  OR 
  (category_type IN ('income', 'savings') AND is_essential IS NULL)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PASO 7: Eliminar categorías duplicadas ANTES de agregar constraint único
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 7.1: Identificar y consolidar duplicados manteniendo la más reciente
--      (Cuando hay mismo budget_id + name, quedarnos con la más reciente)

-- Primero, crear tabla temporal con IDs de registros a mantener
CREATE TEMP TABLE categories_to_keep AS
SELECT DISTINCT ON (budget_id, name) id
FROM budget_categories
ORDER BY budget_id, name, created_at DESC;

-- 7.2: Actualizar transacciones que apuntan a categorías duplicadas
--      para que apunten a la categoría que vamos a mantener
UPDATE budget_transactions bt
SET category_id = (
  SELECT ctk.id 
  FROM categories_to_keep ctk
  JOIN budget_categories bc ON bc.id = ctk.id
  WHERE bc.budget_id = (SELECT budget_id FROM budget_categories WHERE id = bt.category_id)
    AND bc.name = (SELECT name FROM budget_categories WHERE id = bt.category_id)
  LIMIT 1
)
WHERE category_id IS NOT NULL
  AND category_id NOT IN (SELECT id FROM categories_to_keep);

-- 7.3: Actualizar subcategorías que apuntan a categorías duplicadas
UPDATE budget_subcategories bs
SET category_id = (
  SELECT ctk.id 
  FROM categories_to_keep ctk
  JOIN budget_categories bc ON bc.id = ctk.id
  WHERE bc.budget_id = (SELECT budget_id FROM budget_categories WHERE id = bs.category_id)
    AND bc.name = (SELECT name FROM budget_categories WHERE id = bs.category_id)
  LIMIT 1
)
WHERE category_id NOT IN (SELECT id FROM categories_to_keep);

-- 7.4: Eliminar categorías duplicadas (las que NO están en la lista de mantener)
DELETE FROM budget_categories
WHERE id NOT IN (SELECT id FROM categories_to_keep);

-- 7.5: Limpiar tabla temporal
DROP TABLE categories_to_keep;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PASO 8: Actualizar constraint UNIQUE para incluir nueva estructura
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 8.1: Eliminar constraint único antiguo (no es índice, es constraint)
ALTER TABLE budget_categories 
DROP CONSTRAINT IF EXISTS budget_categories_budget_id_name_category_type_key;

-- 8.2: Crear nuevo constraint único (más simple, sin category_type)
ALTER TABLE budget_categories
ADD CONSTRAINT budget_categories_unique_name_per_budget 
UNIQUE (budget_id, name);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PASO 9: Actualizar comentarios para documentación
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMENT ON COLUMN budget_categories.category_type IS 
'Tipo de categoría: income (ingreso), expense (gasto), savings (ahorro)';

COMMENT ON COLUMN budget_categories.is_essential IS 
'Solo para gastos: true (esencial), false (no esencial), NULL (no aplica)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- RESUMEN DE LA MIGRACIÓN
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 
-- ESTRUCTURA ANTERIOR:
--   category_type: 'income' | 'fixed_expense' | 'variable_expense'
--   is_essential: boolean (poco usado)
--
-- ESTRUCTURA NUEVA:
--   category_type: 'income' | 'expense' | 'savings'
--   expense_type: 'fixed' | 'variable' (solo para gastos)
--   is_essential: true | false (solo para gastos)
--
-- CLASIFICACIÓN DE GASTOS:
--   - Gasto Fijo Esencial
--   - Gasto Fijo No Esencial
--   - Gasto Variable Esencial
--   - Gasto Variable No Esencial
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

