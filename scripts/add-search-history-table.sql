-- Create search_history table for persistent search history
-- This allows users to have their search history saved in the database and synced across devices

-- Create the search_history table
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    search_type VARCHAR(20) DEFAULT 'search' CHECK (search_type IN ('search', 'trending', 'suggestion')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(user_id, query);

-- Add unique constraint to prevent duplicate searches per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_search_history_user_query ON search_history(user_id, LOWER(query));

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_search_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trg_update_search_history_updated_at ON search_history;
CREATE TRIGGER trg_update_search_history_updated_at
    BEFORE UPDATE ON search_history
    FOR EACH ROW EXECUTE FUNCTION update_search_history_updated_at();

-- Function to clean up old search history (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_search_history()
RETURNS VOID AS $$
BEGIN
    DELETE FROM search_history 
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own search history
DROP POLICY IF EXISTS "Users can view their own search history" ON search_history;
CREATE POLICY "Users can view their own search history" ON search_history
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own search history
DROP POLICY IF EXISTS "Users can insert their own search history" ON search_history;
CREATE POLICY "Users can insert their own search history" ON search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own search history
DROP POLICY IF EXISTS "Users can update their own search history" ON search_history;
CREATE POLICY "Users can update their own search history" ON search_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own search history
DROP POLICY IF EXISTS "Users can delete their own search history" ON search_history;
CREATE POLICY "Users can delete their own search history" ON search_history
    FOR DELETE USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE search_history IS 'Stores user search history for persistent cross-device search suggestions';
COMMENT ON COLUMN search_history.query IS 'The search query text';
COMMENT ON COLUMN search_history.search_type IS 'Type of search: search, trending, or suggestion';
COMMENT ON COLUMN search_history.created_at IS 'When the search was first performed';
COMMENT ON COLUMN search_history.updated_at IS 'When the search was last performed (for ranking recent searches)';
