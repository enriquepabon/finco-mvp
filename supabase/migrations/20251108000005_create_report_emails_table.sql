-- Migration: Create report_emails table
-- Description: Tabla para registrar los reportes financieros enviados por email
-- Date: 2025-11-08

-- Crear tabla de registro de emails enviados
CREATE TABLE IF NOT EXISTS report_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  email_id TEXT, -- ID del email en el servicio (Resend)
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para mejorar el rendimiento
CREATE INDEX idx_report_emails_user_id ON report_emails(user_id);
CREATE INDEX idx_report_emails_budget_id ON report_emails(budget_id);
CREATE INDEX idx_report_emails_sent_at ON report_emails(sent_at DESC);

-- Comentarios
COMMENT ON TABLE report_emails IS 'Registro de reportes financieros enviados por email';
COMMENT ON COLUMN report_emails.user_id IS 'Usuario que envió el reporte';
COMMENT ON COLUMN report_emails.budget_id IS 'Presupuesto del reporte enviado';
COMMENT ON COLUMN report_emails.recipient_email IS 'Email del destinatario';
COMMENT ON COLUMN report_emails.email_id IS 'ID del email en el servicio de envío (Resend)';
COMMENT ON COLUMN report_emails.sent_at IS 'Fecha y hora de envío del email';

