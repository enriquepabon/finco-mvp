-- =====================================================
-- TABLA: financial_reports
-- Almacena reportes financieros generados por IA
-- =====================================================

CREATE TABLE IF NOT EXISTS public.financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_financial_reports_user_id 
  ON public.financial_reports(user_id);

CREATE INDEX IF NOT EXISTS idx_financial_reports_generated_at 
  ON public.financial_reports(generated_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_financial_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_financial_reports_updated_at
  BEFORE UPDATE ON public.financial_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_financial_reports_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo pueden ver sus propios reportes
CREATE POLICY "Users can view their own reports"
  ON public.financial_reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuarios pueden crear sus propios reportes
CREATE POLICY "Users can create their own reports"
  ON public.financial_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Service role puede gestionar todos los reportes
CREATE POLICY "Service role can manage all reports"
  ON public.financial_reports
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE public.financial_reports IS 
  'Almacena reportes financieros generados por IA (MentorIA) para cada usuario';

COMMENT ON COLUMN public.financial_reports.report_data IS 
  'Datos del reporte en formato JSON (incluye análisis, recomendaciones, métricas)';

COMMENT ON COLUMN public.financial_reports.generated_at IS 
  'Fecha y hora en que se generó el reporte';

