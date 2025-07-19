-- Crear tabla de perfiles de usuario para el onboarding
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información básica
  full_name TEXT,
  age INTEGER,
  civil_status TEXT CHECK (civil_status IN ('soltero', 'casado', 'union_libre', 'divorciado', 'viudo')),
  children_count INTEGER DEFAULT 0,
  
  -- Información financiera (todos los montos en pesos colombianos)
  monthly_income DECIMAL(15,2), -- Ingresos mensuales totales
  monthly_expenses DECIMAL(15,2), -- Gastos mensuales totales
  total_assets DECIMAL(15,2), -- Activos totales (casa, carro, etc.)
  total_liabilities DECIMAL(15,2), -- Pasivos totales (deudas)
  total_savings DECIMAL(15,2), -- Ahorros actuales
  
  -- Metadatos
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices únicos
  UNIQUE(user_id)
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding ON user_profiles(onboarding_completed);

-- Habilitar Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política RLS: Los usuarios solo pueden ver y modificar su propio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE user_profiles IS 'Perfiles de usuario con información básica del onboarding';
COMMENT ON COLUMN user_profiles.monthly_income IS 'Ingresos mensuales totales en pesos colombianos';
COMMENT ON COLUMN user_profiles.monthly_expenses IS 'Gastos mensuales totales en pesos colombianos';
COMMENT ON COLUMN user_profiles.total_assets IS 'Activos totales en pesos colombianos';
COMMENT ON COLUMN user_profiles.total_liabilities IS 'Pasivos/deudas totales en pesos colombianos';
COMMENT ON COLUMN user_profiles.total_savings IS 'Ahorros actuales en pesos colombianos'; 