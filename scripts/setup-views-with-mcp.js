// Setup views system using manual SQL - copy and paste into Supabase SQL Editor
// This script provides the SQL to run manually in your Supabase dashboard

console.log(`
📋 VIEWS SYSTEM SETUP - MANUAL INSTRUCTIONS
==========================================

Copy and paste the following SQL into your Supabase SQL Editor:
(Dashboard → SQL Editor → New Query)

`)

const sql = `
-- 1. Add views column to works table if it doesn't exist
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 2. Create work_views table for detailed analytics (optional)
CREATE TABLE IF NOT EXISTS work_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id UUID REFERENCES works(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  UNIQUE(work_id, user_id)
);

-- 3. Create RPC function to increment views atomically
CREATE OR REPLACE FUNCTION increment_work_views(work_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE works 
  SET views = COALESCE(views, 0) + 1,
      updated_at = NOW()
  WHERE id = work_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Work not found';
  END IF;
END;
$$;

-- 4. Create function to get popular works
CREATE OR REPLACE FUNCTION get_popular_works(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  genre TEXT,
  views INTEGER,
  likes INTEGER,
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  cover_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.title,
    w.description,
    w.genre,
    COALESCE(w.views, 0) as views,
    COALESCE(w.likes, 0) as likes,
    w.author_id,
    w.created_at,
    w.cover_url
  FROM works w
  WHERE w.published = true
  ORDER BY COALESCE(w.views, 0) DESC, w.created_at DESC
  LIMIT limit_count;
END;
$$;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_works_views ON works(views DESC);
CREATE INDEX IF NOT EXISTS idx_works_published_views ON works(published, views DESC);
CREATE INDEX IF NOT EXISTS idx_work_views_work_id ON work_views(work_id);
CREATE INDEX IF NOT EXISTS idx_work_views_user_id ON work_views(user_id);
CREATE INDEX IF NOT EXISTS idx_work_views_viewed_at ON work_views(viewed_at DESC);

-- 6. Enable RLS on work_views table
ALTER TABLE work_views ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
CREATE POLICY "Users can view their own view records" ON work_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert view records" ON work_views
  FOR INSERT WITH CHECK (true);

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON works TO anon, authenticated;
GRANT INSERT ON work_views TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_work_views TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_popular_works TO anon, authenticated;

-- 9. Update existing works to have 0 views if NULL
UPDATE works SET views = 0 WHERE views IS NULL;
`

console.log(sql)

console.log(`
==========================================

📋 AFTER RUNNING THE SQL:

1. ✅ The views system will be ready
2. 🧪 Test it by visiting any work page - views should increment
3. 📊 Check the works table to see view counts
4. 🔍 Use the get_popular_works() function to get popular content

📝 Test queries you can run:

-- Get all works with their view counts
SELECT title, views FROM works ORDER BY views DESC LIMIT 10;

-- Get popular works using the new function
SELECT * FROM get_popular_works(5);

-- Manually increment views for testing
SELECT increment_work_views('YOUR_WORK_ID_HERE');

==========================================
`)

console.log('✨ Setup complete! Run the SQL above in your Supabase dashboard.')

