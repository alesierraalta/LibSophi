-- Sync existing auth.users that don't have profiles
DO $$
DECLARE
  user_record RECORD;
  profile_username TEXT;
  profile_name TEXT;
BEGIN
  -- Loop through all users in auth.users that don't have a profile
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data, u.created_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL
      AND u.email IS NOT NULL
      AND u.deleted_at IS NULL
  LOOP
    -- Generate username from metadata or email
    profile_username := COALESCE(
      user_record.raw_user_meta_data->>'username',
      '@' || SPLIT_PART(user_record.email, '@', 1)
    );
    
    -- Generate name from metadata or email
    profile_name := COALESCE(
      user_record.raw_user_meta_data->>'name',
      SPLIT_PART(user_record.email, '@', 1)
    );
    
    -- Insert profile for this user
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
      user_record.id,
      profile_name,
      profile_username,
      'Nuevo en Palabreo ✨',
      '/api/placeholder/112/112',
      '',
      user_record.created_at,
      NOW()
    );
    
    RAISE NOTICE 'Created profile for user: % with username: %', user_record.email, profile_username;
  END LOOP;
  
  RAISE NOTICE 'Finished syncing existing users with profiles';
END $$;
