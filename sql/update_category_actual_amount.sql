-- ============================================================================
-- FUNCIÓN PARA ACTUALIZAR ACTUAL_AMOUNT BASADO EN TRANSACCIONES
-- FINCO - Sistema de Registro de Transacciones
-- ============================================================================

-- Función para actualizar actual_amount de una categoría
CREATE OR REPLACE FUNCTION update_category_actual_from_transactions(p_category_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total DECIMAL(15,2);
BEGIN
  -- Calcular el total de transacciones para esta categoría
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total
  FROM budget_transactions
  WHERE category_id = p_category_id;
  
  -- Actualizar el actual_amount de la categoría
  UPDATE budget_categories
  SET actual_amount = v_total,
      updated_at = NOW()
  WHERE id = p_category_id;
  
  RAISE NOTICE 'Updated category % actual_amount to %', p_category_id, v_total;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar actual_amount de una subcategoría
CREATE OR REPLACE FUNCTION update_subcategory_actual_from_transactions(p_subcategory_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total DECIMAL(15,2);
BEGIN
  -- Calcular el total de transacciones para esta subcategoría
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total
  FROM budget_transactions
  WHERE subcategory_id = p_subcategory_id;
  
  -- Actualizar el actual_amount de la subcategoría
  UPDATE budget_subcategories
  SET actual_amount = v_total,
      updated_at = NOW()
  WHERE id = p_subcategory_id;
  
  RAISE NOTICE 'Updated subcategory % actual_amount to %', p_subcategory_id, v_total;
END;
$$ LANGUAGE plpgsql;

-- Trigger automático para actualizar actual_amount al insertar/actualizar/eliminar transacción
CREATE OR REPLACE FUNCTION trigger_update_actual_amount_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- En INSERT o UPDATE, actualizar la categoría/subcategoría nueva
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF NEW.category_id IS NOT NULL THEN
      PERFORM update_category_actual_from_transactions(NEW.category_id);
    END IF;
    
    IF NEW.subcategory_id IS NOT NULL THEN
      PERFORM update_subcategory_actual_from_transactions(NEW.subcategory_id);
    END IF;
  END IF;
  
  -- En UPDATE, si cambió la categoría, actualizar la vieja también
  IF (TG_OP = 'UPDATE') THEN
    IF OLD.category_id IS NOT NULL AND OLD.category_id != NEW.category_id THEN
      PERFORM update_category_actual_from_transactions(OLD.category_id);
    END IF;
    
    IF OLD.subcategory_id IS NOT NULL AND OLD.subcategory_id != NEW.subcategory_id THEN
      PERFORM update_subcategory_actual_from_transactions(OLD.subcategory_id);
    END IF;
  END IF;
  
  -- En DELETE, actualizar la categoría/subcategoría vieja
  IF (TG_OP = 'DELETE') THEN
    IF OLD.category_id IS NOT NULL THEN
      PERFORM update_category_actual_from_transactions(OLD.category_id);
    END IF;
    
    IF OLD.subcategory_id IS NOT NULL THEN
      PERFORM update_subcategory_actual_from_transactions(OLD.subcategory_id);
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear o reemplazar trigger
DROP TRIGGER IF EXISTS update_actual_amount_on_transaction ON budget_transactions;

CREATE TRIGGER update_actual_amount_on_transaction
  AFTER INSERT OR UPDATE OR DELETE ON budget_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_actual_amount_on_transaction();

-- Comentarios
COMMENT ON FUNCTION update_category_actual_from_transactions(UUID) IS 
  'Actualiza el actual_amount de una categoría sumando todas sus transacciones';

COMMENT ON FUNCTION update_subcategory_actual_from_transactions(UUID) IS 
  'Actualiza el actual_amount de una subcategoría sumando todas sus transacciones';

COMMENT ON FUNCTION trigger_update_actual_amount_on_transaction() IS 
  'Trigger que actualiza automáticamente actual_amount cuando se modifica una transacción';

-- Verificación
SELECT 'Funciones de actualización de actual_amount creadas exitosamente! ✅' as status;

