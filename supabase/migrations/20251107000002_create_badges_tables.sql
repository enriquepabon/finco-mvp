-- Migration: Create badges and user_badges tables for MentorIA gamification system
-- Created: 2025-11-07
-- Description: Sistema de logros (badges) para gamificación sutil y celebraciones

-- ============================================
-- TABLE: badges
-- ============================================

-- Create badges table (catalog of available badges)
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL, -- Emoji o nombre de icono
    category VARCHAR(50) NOT NULL, -- 'streak', 'savings', 'habits', 'milestones'
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    
    -- Criterios de desbloqueo (JSON)
    criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Ejemplo de criterios:
    -- {"type": "streak", "habit_type": "daily_expense_log", "days": 7}
    -- {"type": "transaction_count", "count": 10}
    -- {"type": "savings_goal", "amount": 5000}
    -- {"type": "budget_completion", "months": 1}
    
    -- Metadatos
    points INTEGER DEFAULT 10, -- Puntos que otorga el badge
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE: user_badges
-- ============================================

-- Create user_badges table (badges earned by users)
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    
    -- Información del logro
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    progress_data JSONB DEFAULT '{}'::jsonb, -- Datos del progreso al ganarlo
    
    -- Métricas
    is_seen BOOLEAN DEFAULT FALSE, -- Si el usuario ya vio la celebración
    seen_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraint: Un usuario solo puede ganar un badge una vez
    UNIQUE(user_id, badge_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Index on badge category for filtering
CREATE INDEX IF NOT EXISTS idx_badges_category 
ON public.badges(category);

-- Index on badge slug for lookups
CREATE INDEX IF NOT EXISTS idx_badges_slug 
ON public.badges(slug);

-- Index on user_id for fast user badge queries
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id 
ON public.user_badges(user_id);

-- Index on badge_id for badge statistics
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id 
ON public.user_badges(badge_id);

-- Index on earned_at for recent badges
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at 
ON public.user_badges(earned_at DESC);

-- Composite index for unseen badges
CREATE INDEX IF NOT EXISTS idx_user_badges_unseen 
ON public.user_badges(user_id, is_seen) WHERE is_seen = FALSE;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own badges
CREATE POLICY "Users can view their own badges" 
ON public.user_badges
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: System can insert badges (via service role)
CREATE POLICY "System can insert badges" 
ON public.user_badges
FOR INSERT
WITH CHECK (true); -- Service role only

-- Policy: Users can update their own badges (mark as seen)
CREATE POLICY "Users can update their own badges" 
ON public.user_badges
FOR UPDATE
USING (auth.uid() = user_id);

-- Badges table is read-only for all authenticated users
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" 
ON public.badges
FOR SELECT
USING (is_active = TRUE);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================

-- Function already exists from habits migration
-- Just create trigger for badges table
CREATE TRIGGER update_badges_updated_at
BEFORE UPDATE ON public.badges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SEED DATA: Initial Badges
-- ============================================

INSERT INTO public.badges (name, slug, description, icon, category, rarity, criteria, points, sort_order) VALUES
-- Streak Badges
(
    'Primer Paso',
    'first-step',
    '¡Registraste tu primer gasto! Todo gran viaje comienza con un paso.',
    '🎯',
    'habits',
    'common',
    '{"type": "transaction_count", "count": 1}'::jsonb,
    10,
    1
),
(
    'Racha de 3 Días',
    'streak-3',
    '¡3 días consecutivos registrando! Vas por buen camino.',
    '🔥',
    'streak',
    'common',
    '{"type": "streak", "habit_type": "daily_expense_log", "days": 3}'::jsonb,
    20,
    2
),
(
    'Primera Semana',
    'streak-7',
    '¡7 días seguidos! Ya eres parte del 30% que lo logra.',
    '⭐',
    'streak',
    'rare',
    '{"type": "streak", "habit_type": "daily_expense_log", "days": 7}'::jsonb,
    50,
    3
),
(
    'Constancia (21 días)',
    'streak-21',
    '¡21 días! Los expertos dicen que ya formaste un hábito.',
    '💪',
    'streak',
    'epic',
    '{"type": "streak", "habit_type": "daily_expense_log", "days": 21}'::jsonb,
    100,
    4
),

-- Savings Badges
(
    'Primer Ahorro',
    'first-savings',
    '¡Tu primera contribución al ahorro! Cada peso cuenta.',
    '💰',
    'savings',
    'common',
    '{"type": "savings_contribution", "count": 1}'::jsonb,
    15,
    5
),

-- Budget Badges
(
    'Presupuesto Creado',
    'budget-created',
    '¡Tu primer presupuesto! Ahora tienes un plan.',
    '📊',
    'milestones',
    'common',
    '{"type": "budget_created", "count": 1}'::jsonb,
    25,
    6
),

-- Milestone Badges
(
    'Mes Completo',
    'month-complete',
    '¡Completaste tu primer mes! Esto es un logro importante.',
    '🏆',
    'milestones',
    'rare',
    '{"type": "streak", "habit_type": "daily_expense_log", "days": 30}'::jsonb,
    150,
    7
),

-- Goal Badges
(
    'Primera Meta',
    'first-goal',
    '¡Alcanzaste tu primera meta! Eres imparable.',
    '🎉',
    'milestones',
    'epic',
    '{"type": "goal_completed", "count": 1}'::jsonb,
    200,
    8
);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.badges IS 'Catálogo de badges (logros) disponibles en MentorIA';
COMMENT ON TABLE public.user_badges IS 'Badges ganados por usuarios';

COMMENT ON COLUMN public.badges.criteria IS 'Criterios de desbloqueo en formato JSON';
COMMENT ON COLUMN public.badges.rarity IS 'Rareza del badge: common, rare, epic, legendary';
COMMENT ON COLUMN public.badges.points IS 'Puntos que otorga el badge';

COMMENT ON COLUMN public.user_badges.progress_data IS 'Datos del progreso al momento de ganar el badge';
COMMENT ON COLUMN public.user_badges.is_seen IS 'Si el usuario ya vio la celebración del badge';

