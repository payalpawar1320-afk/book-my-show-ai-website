-- Add DELETE policy for profiles table to allow users to delete their own profile (GDPR compliance)
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Add DELETE policy for user_preferences table for consistency
CREATE POLICY "Users can delete their own preferences"
  ON public.user_preferences FOR DELETE
  USING (auth.uid() = user_id);