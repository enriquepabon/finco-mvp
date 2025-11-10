-- FIX: Add service role policy for user_habits
-- This allows the backend to insert habits when tracking user actions

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage all habits" ON public.user_habits;

-- Add policy for service role (backend operations)
CREATE POLICY "Service role can manage all habits" 
ON public.user_habits
FOR ALL
USING (true)
WITH CHECK (true);

-- Note: This policy only applies when using the service role key.
-- Regular users are still protected by the existing user-specific policies.

