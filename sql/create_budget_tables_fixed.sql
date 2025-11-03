-- ============================================================================
-- SCRIPT CORREGIDO PARA CREAR TABLAS DE PRESUPUESTO EN SUPABASE
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- Versión: 1.0.1 - CORREGIDA
-- Fecha: Enero 2025
-- ============================================================================

-- PASO 1: CREAR TODAS LAS TABLAS PRIMERO
-- ============================================================================

-- TABLA PRINCIPAL: budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información del período
  budget_month INTEGER NOT NULL CHECK (budget_month >= 1 AND budget_month <= 12),
  budget_year INTEGER NOT NULL CHECK (budget_year >= 2020 AND budget_year <= 2100),
  
  -- Totales calculados
  total_income DECIMAL(15,2) DEFAULT 0,
  total_fixed_expenses DECIMAL(15,2) DEFAULT 0,
  total_variable_expenses DECIMAL(15,2) DEFAULT 0,
  total_savings_goal DECIMAL(15,2) DEFAULT 0,
  
  -- Totales reales (seguimiento)
  actual_income DECIMAL(15,2) DEFAULT 0,
  actual_fixed_expenses DECIMAL(15,2) DEFAULT 0,
  actual_variable_expenses DECIMAL(15,2) DEFAULT 0,
  actual_savings DECIMAL(15,2) DEFAULT 0,
  
  -- Estado y metadatos
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_via_chat BOOLEAN DEFAULT TRUE,
  chat_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índice único por usuario, mes y año
  UNIQUE(user_id, budget_month, budget_year)
);

-- TABLA: budget_categories
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información de la categoría
  name TEXT NOT NULL,
  description TEXT,
  category_type TEXT NOT NULL CHECK (category_type IN ('income', 'fixed_expense', 'variable_expense')),
  
  -- Montos
  budgeted_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(15,2) DEFAULT 0,
  
  -- Configuración
  is_essential BOOLEAN DEFAULT FALSE,
  alert_threshold DECIMAL(5,2) DEFAULT 90.00,
  icon_name TEXT,
  color_hex TEXT DEFAULT '#3B82F6',
  
  -- Orden y organización
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices
  UNIQUE(budget_id, name, category_type)
);

-- TABLA: budget_subcategories
CREATE TABLE IF NOT EXISTS budget_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información de la subcategoría
  name TEXT NOT NULL,
  description TEXT,
  
  -- Montos
  budgeted_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(15,2) DEFAULT 0,
  
  -- Configuración
  alert_threshold DECIMAL(5,2) DEFAULT 90.00,
  icon_name TEXT,
  
  -- Orden
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices
  UNIQUE(category_id, name)
);

-- TABLA: budget_transactions
CREATE TABLE IF NOT EXISTS budget_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES budget_subcategories(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información de la transacción
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  
  -- Fecha y ubicación
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  location TEXT,
  notes TEXT,
  
  -- Clasificación automática
  auto_categorized BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(5,2),
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: budget_alerts
CREATE TABLE IF NOT EXISTS budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES budget_subcategories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información de la alerta
  alert_type TEXT NOT NULL CHECK (alert_type IN ('threshold_exceeded', 'budget_completed', 'category_overspent', 'monthly_summary')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error')),
  
  -- Estado
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  
  -- Datos contextuales
  threshold_percentage DECIMAL(5,2),
  amount_exceeded DECIMAL(15,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- TABLA: budget_chat_history
CREATE TABLE IF NOT EXISTS budget_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información del mensaje
  question_number INTEGER NOT NULL,
  user_message TEXT NOT NULL,
  finco_response TEXT NOT NULL,
  
  -- Datos parseados
  parsed_data JSONB,
  categories_created JSONB,
  
  -- Metadatos
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 2: CREAR ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, budget_year, budget_month);
CREATE INDEX IF NOT EXISTS idx_budget_categories_budget ON budget_categories(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_type ON budget_categories(category_type);
CREATE INDEX IF NOT EXISTS idx_budget_subcategories_category ON budget_subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_budget ON budget_transactions(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_date ON budget_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_user_unread ON budget_alerts(user_id, is_read) WHERE is_read = FALSE;

-- PASO 3: CREAR FUNCIONES
-- ============================================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_budget_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para recalcular totales del presupuesto
CREATE OR REPLACE FUNCTION recalculate_budget_totals(budget_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE budgets SET
    total_income = (
      SELECT COALESCE(SUM(budgeted_amount), 0)
      FROM budget_categories
      WHERE budget_id = budget_uuid AND category_type = 'income' AND is_active = TRUE
    ),
    total_fixed_expenses = (
      SELECT COALESCE(SUM(budgeted_amount), 0)
      FROM budget_categories
      WHERE budget_id = budget_uuid AND category_type = 'fixed_expense' AND is_active = TRUE
    ),
    total_variable_expenses = (
      SELECT COALESCE(SUM(budgeted_amount), 0)
      FROM budget_categories
      WHERE budget_id = budget_uuid AND category_type = 'variable_expense' AND is_active = TRUE
    ),
    actual_income = (
      SELECT COALESCE(SUM(actual_amount), 0)
      FROM budget_categories
      WHERE budget_id = budget_uuid AND category_type = 'income' AND is_active = TRUE
    ),
    actual_fixed_expenses = (
      SELECT COALESCE(SUM(actual_amount), 0)
      FROM budget_categories
      WHERE budget_id = budget_uuid AND category_type = 'fixed_expense' AND is_active = TRUE
    ),
    actual_variable_expenses = (
      SELECT COALESCE(SUM(actual_amount), 0)
      FROM budget_categories
      WHERE budget_id = budget_uuid AND category_type = 'variable_expense' AND is_active = TRUE
    )
  WHERE id = budget_uuid;
END;
$$ LANGUAGE plpgsql;

-- Función para trigger de recálculo
CREATE OR REPLACE FUNCTION trigger_recalculate_budget_totals()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_budget_totals(COALESCE(NEW.budget_id, OLD.budget_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- PASO 4: CREAR TRIGGERS (DESPUÉS DE LAS TABLAS)
-- ============================================================================

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_budget_updated_at();

DROP TRIGGER IF EXISTS update_budget_categories_updated_at ON budget_categories;
CREATE TRIGGER update_budget_categories_updated_at
  BEFORE UPDATE ON budget_categories
  FOR EACH ROW EXECUTE FUNCTION update_budget_updated_at();

DROP TRIGGER IF EXISTS update_budget_subcategories_updated_at ON budget_subcategories;
CREATE TRIGGER update_budget_subcategories_updated_at
  BEFORE UPDATE ON budget_subcategories
  FOR EACH ROW EXECUTE FUNCTION update_budget_updated_at();

DROP TRIGGER IF EXISTS update_budget_transactions_updated_at ON budget_transactions;
CREATE TRIGGER update_budget_transactions_updated_at
  BEFORE UPDATE ON budget_transactions
  FOR EACH ROW EXECUTE FUNCTION update_budget_updated_at();

-- Trigger para recálculo automático
DROP TRIGGER IF EXISTS recalculate_on_category_change ON budget_categories;
CREATE TRIGGER recalculate_on_category_change
  AFTER INSERT OR UPDATE OR DELETE ON budget_categories
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_budget_totals();

-- PASO 5: HABILITAR RLS
-- ============================================================================

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_chat_history ENABLE ROW LEVEL SECURITY;

-- PASO 6: CREAR POLÍTICAS RLS
-- ============================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view own budget_categories" ON budget_categories;
DROP POLICY IF EXISTS "Users can view own budget_subcategories" ON budget_subcategories;
DROP POLICY IF EXISTS "Users can view own budget_transactions" ON budget_transactions;
DROP POLICY IF EXISTS "Users can view own budget_alerts" ON budget_alerts;
DROP POLICY IF EXISTS "Users can view own budget_chat_history" ON budget_chat_history;

-- Crear nuevas políticas
CREATE POLICY "Users can view own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own budget_categories" ON budget_categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own budget_subcategories" ON budget_subcategories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own budget_transactions" ON budget_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own budget_alerts" ON budget_alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own budget_chat_history" ON budget_chat_history FOR ALL USING (auth.uid() = user_id);

-- PASO 7: AGREGAR COMENTARIOS
-- ============================================================================

COMMENT ON TABLE budgets IS 'Presupuestos mensuales de los usuarios con seguimiento de totales';
COMMENT ON TABLE budget_categories IS 'Categorías flexibles de ingresos y gastos definidas por el usuario';
COMMENT ON TABLE budget_subcategories IS 'Subcategorías para desglose detallado de cada categoría principal';
COMMENT ON TABLE budget_transactions IS 'Transacciones reales para seguimiento vs presupuesto';
COMMENT ON TABLE budget_alerts IS 'Sistema de alertas y notificaciones para control de presupuesto';
COMMENT ON TABLE budget_chat_history IS 'Historial del chat conversacional de creación de presupuesto';

-- PASO 8: VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar que las tablas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  tableowner,
  rowsecurity
FROM pg_tables 
WHERE tablename LIKE 'budget%'
ORDER BY tablename;

-- Verificar funciones
SELECT 
  proname,
  pronargs
FROM pg_proc 
WHERE proname LIKE '%budget%';

-- Mensaje de éxito
SELECT '🎉 FINCO Budget Tables created successfully!' as status,
       'All tables, functions, triggers and RLS policies are ready.' as details; 