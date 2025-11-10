/*
  MIGRACIÓN: Limpiar categorías genéricas "Gastos Fijos" y "Gastos Variables"
  Fecha: 2025-11-08
  Descripción: Reasigna transacciones y elimina categorías contenedoras antiguas
*/

/* PASO 1: Reasignar transacciones de categorías genéricas a sus subcategorías */

DO $$
DECLARE
  generic_cat RECORD;
  trans RECORD;
BEGIN
  -- Encontrar categorías genéricas "Gastos Fijos" y "Gastos Variables"
  FOR generic_cat IN 
    SELECT id, name, budget_id
    FROM budget_categories
    WHERE name IN ('Gastos Fijos', 'Gastos Variables')
      AND category_type = 'expense'
      AND is_active = true
  LOOP
    RAISE NOTICE 'Procesando categoría genérica: % (ID: %)', generic_cat.name, generic_cat.id;
    
    -- Para cada transacción en esta categoría que NO tiene subcategoría
    -- (las que sí tienen subcategoría ya están bien)
    UPDATE budget_transactions
    SET 
      -- Si no tiene subcategoría, marcamos para revisión manual
      notes = COALESCE(notes, '') || 
              E'\n[MIGRACIÓN] Transacción de categoría genérica "' || generic_cat.name || 
              '" requiere revisión. Por favor, asigna a una categoría específica.'
    WHERE category_id = generic_cat.id
      AND subcategory_id IS NULL;
    
    RAISE NOTICE 'Transacciones sin subcategoría marcadas para revisión';
    
  END LOOP;
END $$;


/* PASO 2: Desactivar (soft delete) las categorías genéricas */

UPDATE budget_categories
SET 
  is_active = false,
  updated_at = NOW()
WHERE name IN ('Gastos Fijos', 'Gastos Variables')
  AND category_type = 'expense'
  AND is_active = true;


/* PASO 3: Desactivar subcategorías huérfanas (de categorías desactivadas) */

UPDATE budget_subcategories
SET 
  is_active = false,
  updated_at = NOW()
WHERE category_id IN (
  SELECT id 
  FROM budget_categories 
  WHERE name IN ('Gastos Fijos', 'Gastos Variables')
    AND category_type = 'expense'
    AND is_active = false
)
AND is_active = true;


/* PASO 4: Reportar el resultado */

DO $$
DECLARE
  cats_desactivadas INTEGER;
  subcats_desactivadas INTEGER;
  trans_sin_subcat INTEGER;
BEGIN
  -- Contar categorías desactivadas
  SELECT COUNT(*) INTO cats_desactivadas
  FROM budget_categories
  WHERE name IN ('Gastos Fijos', 'Gastos Variables')
    AND category_type = 'expense'
    AND is_active = false;
  
  -- Contar subcategorías desactivadas
  SELECT COUNT(*) INTO subcats_desactivadas
  FROM budget_subcategories
  WHERE category_id IN (
    SELECT id 
    FROM budget_categories 
    WHERE name IN ('Gastos Fijos', 'Gastos Variables')
      AND category_type = 'expense'
      AND is_active = false
  )
  AND is_active = false;
  
  -- Contar transacciones que requieren revisión
  SELECT COUNT(*) INTO trans_sin_subcat
  FROM budget_transactions
  WHERE category_id IN (
    SELECT id 
    FROM budget_categories 
    WHERE name IN ('Gastos Fijos', 'Gastos Variables')
      AND category_type = 'expense'
  )
  AND subcategory_id IS NULL;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESUMEN DE MIGRACIÓN:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Categorías genéricas desactivadas: %', cats_desactivadas;
  RAISE NOTICE 'Subcategorías desactivadas: %', subcats_desactivadas;
  RAISE NOTICE 'Transacciones marcadas para revisión: %', trans_sin_subcat;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'NOTA: Las subcategorías ahora deben promoverse a categorías';
  RAISE NOTICE 'principales usando el UI del dashboard.';
  RAISE NOTICE '========================================';
END $$;


/* COMENTARIOS FINALES */

COMMENT ON COLUMN budget_categories.is_active IS 
'Indica si la categoría está activa. Las categorías genéricas "Gastos Fijos" y "Gastos Variables" fueron desactivadas en la migración 20251108000003.';

COMMENT ON COLUMN budget_subcategories.is_active IS 
'Indica si la subcategoría está activa. Las subcategorías de categorías desactivadas también fueron desactivadas.';

