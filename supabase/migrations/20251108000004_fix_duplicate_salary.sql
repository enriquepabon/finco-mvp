/* ============================================================================
 * MIGRACIÓN: Eliminar categorías duplicadas cuando existen como subcategorías
 * ============================================================================
 * Fecha: 2025-11-08
 * Descripción: Identifica y elimina categorías que tienen el mismo nombre
 *              que subcategorías existentes para evitar confusión.
 *              Ejemplo: Si existe "Ingresos" → "Salario" (subcategoría),
 *              elimina la categoría "Salario" duplicada.
 * ============================================================================ */

-- Paso 1: Identificar y reportar categorías duplicadas
DO $$
DECLARE
  duplicate_record RECORD;
  transaction_count INT;
  affected_count INT := 0;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🔍 ANÁLISIS DE CATEGORÍAS DUPLICADAS';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';

  /* Buscar categorías que tengan el mismo nombre que subcategorías existentes */
  FOR duplicate_record IN
    SELECT 
      c.id as category_id,
      c.name as category_name,
      c.budget_id,
      c.category_type,
      s.id as subcategory_id,
      s.name as subcategory_name,
      s.category_id as parent_category_id,
      pc.name as parent_category_name
    FROM budget_categories c
    INNER JOIN budget_subcategories s 
      ON LOWER(TRIM(c.name)) = LOWER(TRIM(s.name))
      AND c.budget_id = s.budget_id
    INNER JOIN budget_categories pc
      ON s.category_id = pc.id
    WHERE c.id != s.category_id  /* No comparar la categoría consigo misma */
    ORDER BY c.budget_id, c.name
  LOOP
    affected_count := affected_count + 1;
    
    RAISE NOTICE '⚠️  DUPLICADO ENCONTRADO:';
    RAISE NOTICE '   📁 Categoría duplicada: "%" (ID: %)', 
      duplicate_record.category_name, 
      duplicate_record.category_id;
    RAISE NOTICE '   📂 Ya existe como subcategoría de: "%"', 
      duplicate_record.parent_category_name;
    RAISE NOTICE '';

    /* Contar transacciones asociadas a esta categoría duplicada */
    SELECT COUNT(*)
    INTO transaction_count
    FROM budget_transactions
    WHERE category_id = duplicate_record.category_id;

    IF transaction_count > 0 THEN
      RAISE NOTICE '   💰 Transacciones en categoría duplicada: %', transaction_count;
      RAISE NOTICE '   ✅ Reasignando a: "%" → "%"', 
        duplicate_record.parent_category_name,
        duplicate_record.subcategory_name;
      
      /* Reasignar transacciones a la categoría padre correcta con su subcategoría */
      UPDATE budget_transactions
      SET 
        category_id = duplicate_record.parent_category_id,
        subcategory_id = duplicate_record.subcategory_id,
        notes = COALESCE(notes, '') || 
          E'\n[MIGRACIÓN ' || CURRENT_DATE || '] ' ||
          'Movida de categoría duplicada "' || duplicate_record.category_name || 
          '" a subcategoría "' || duplicate_record.subcategory_name || '"'
      WHERE category_id = duplicate_record.category_id;
      
      RAISE NOTICE '   ✅ % transacciones reasignadas', transaction_count;
    ELSE
      RAISE NOTICE '   ℹ️  Sin transacciones asociadas';
    END IF;

    /* Eliminar la categoría duplicada */
    DELETE FROM budget_categories
    WHERE id = duplicate_record.category_id;
    
    RAISE NOTICE '   🗑️  Categoría duplicada eliminada';
    RAISE NOTICE '';
    RAISE NOTICE '   ─────────────────────────────────────────';
    RAISE NOTICE '';
  END LOOP;

  IF affected_count = 0 THEN
    RAISE NOTICE '✅ No se encontraron categorías duplicadas';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ RESUMEN DE LA LIMPIEZA';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📊 Total de categorías duplicadas eliminadas: %', affected_count;
    RAISE NOTICE '';
  END IF;

  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

END $$;

/* ============================================================================
 * Documentación adicional:
 * 
 * Esta migración es segura de ejecutar múltiples veces (idempotente).
 * Si no encuentra duplicados, simplemente no hace nada.
 * 
 * EJEMPLO DE LO QUE CORRIGE:
 * 
 * ANTES:
 * ┌─────────────────────────────────────┐
 * │ Categorías:                         │
 * │ • Ingresos                          │
 * │   └─ Salario (subcategoría)         │
 * │ • Salario (categoría duplicada) ❌  │
 * └─────────────────────────────────────┘
 * 
 * DESPUÉS:
 * ┌─────────────────────────────────────┐
 * │ Categorías:                         │
 * │ • Ingresos                          │
 * │   └─ Salario (subcategoría)         │
 * └─────────────────────────────────────┘
 * 
 * TRANSACCIONES:
 * - Si había transacciones en "Salario" (categoría), ahora están en
 *   "Ingresos" → "Salario" (subcategoría)
 * - Se agrega una nota en la transacción explicando el cambio
 * ============================================================================ */

