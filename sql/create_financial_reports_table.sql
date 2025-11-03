-- Tabla para almacenar reportes financieros generados por IA
CREATE TABLE financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, generated_at)
);

-- Índices para optimizar consultas
CREATE INDEX idx_financial_reports_user_id ON financial_reports(user_id);
CREATE INDEX idx_financial_reports_generated_at ON financial_reports(generated_at DESC);

-- RLS (Row Level Security)
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios reportes
CREATE POLICY "Users can view own financial reports" ON financial_reports
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios reportes
CREATE POLICY "Users can insert own financial reports" ON financial_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios reportes
CREATE POLICY "Users can update own financial reports" ON financial_reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_financial_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_financial_reports_updated_at
  BEFORE UPDATE ON financial_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_reports_updated_at(); 