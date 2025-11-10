-- Migration: Create user_habits table for MentorIA habit tracking system
-- Created: 2025-11-07
-- Description: Tracks daily habits and streaks for gamification and behavioral nudges

-- ============================================
-- TABLE: user_habits
-- ============================================

-- Create user_habits table
CREATE TABLE IF NOT EXISTS public.user_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_type VARCHAR(50) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    streak_count INTEGER NOT NULL DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Index on user_id for fast user queries
CREATE INDEX IF NOT EXISTS idx_user_habits_user_id 
ON public.user_habits(user_id);

-- Index on habit_type for filtering by habit
CREATE INDEX IF NOT EXISTS idx_user_habits_habit_type 
ON public.user_habits(habit_type);

-- Composite index on user_id and habit_type for common queries
CREATE INDEX IF NOT EXISTS idx_user_habits_user_habit 
ON public.user_habits(user_id, habit_type);

-- Index on completed_at for date range queries
CREATE INDEX IF NOT EXISTS idx_user_habits_completed_at 
ON public.user_habits(completed_at DESC);

-- Composite index for streak calculations
CREATE INDEX IF NOT EXISTS idx_user_habits_streak_lookup 
ON public.user_habits(user_id, habit_type, completed_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own habits
CREATE POLICY "Users can view their own habits" 
ON public.user_habits
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own habits
CREATE POLICY "Users can insert their own habits" 
ON public.user_habits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own habits
CREATE POLICY "Users can update their own habits" 
ON public.user_habits
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own habits
CREATE POLICY "Users can delete their own habits" 
ON public.user_habits
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_habits_updated_at
BEFORE UPDATE ON public.user_habits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- HABIT TYPES (Reference)
-- ============================================

-- Habit types used in the system:
-- - 'daily_expense_log': User logged at least one expense today
-- - 'budget_check': User checked their budget today
-- - 'goal_review': User reviewed their financial goals
-- - 'savings_contribution': User made a savings contribution
-- - 'weekly_review': User completed their weekly financial review
-- - 'document_upload': User uploaded a financial document
-- - 'chat_interaction': User interacted with MentorIA

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.user_habits IS 'Tracks user habits and streaks for gamification';
COMMENT ON COLUMN public.user_habits.id IS 'Unique identifier for each habit record';
COMMENT ON COLUMN public.user_habits.user_id IS 'Foreign key to auth.users';
COMMENT ON COLUMN public.user_habits.habit_type IS 'Type of habit (e.g., daily_expense_log, budget_check)';
COMMENT ON COLUMN public.user_habits.completed_at IS 'Timestamp when the habit was completed';
COMMENT ON COLUMN public.user_habits.streak_count IS 'Current streak count for this habit';
COMMENT ON COLUMN public.user_habits.metadata IS 'Additional data (e.g., transaction_id, amount)';
COMMENT ON COLUMN public.user_habits.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.user_habits.updated_at IS 'Timestamp when the record was last updated';

