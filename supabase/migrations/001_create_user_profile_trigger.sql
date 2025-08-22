-- Function to create a profile for a newly registered user
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    username,
    bio,
    avatar_url,
    banner_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(
      CASE 
        WHEN NEW.raw_user_meta_data->>'username' IS NOT NULL AND NEW.raw_user_meta_data->>'username' != '' 
        THEN NEW.raw_user_meta_data->>'username'
        ELSE '@' || SPLIT_PART(NEW.email, '@', 1)
      END
    ),
    'Nuevo en Palabreo ✨',
    '/api/placeholder/112/112',
    '',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth operation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user registers
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.email IS NOT NULL)
  EXECUTE FUNCTION create_profile_for_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON auth.users TO postgres, service_role;
GRANT SELECT ON auth.users TO anon, authenticated;

-- Ensure profiles table has proper RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all profiles
CREATE POLICY "Users can read all profiles" ON public.profiles
  FOR SELECT USING (true);

-- Policy: Users can only update their own profile  
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow system to insert profiles (for the trigger)
CREATE POLICY "System can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);
