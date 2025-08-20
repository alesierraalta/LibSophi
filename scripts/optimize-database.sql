-- Palabreo Database Optimization Script
-- This script creates indexes and optimizations for better performance

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Works table indexes (most frequently queried)
CREATE INDEX IF NOT EXISTS idx_works_author_id ON works(author_id);
CREATE INDEX IF NOT EXISTS idx_works_published_created ON works(published, created_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_works_genre ON works(genre) WHERE genre IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_works_views ON works(views DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_works_likes ON works(likes DESC) WHERE published = true;

-- Full-text search index for works
CREATE INDEX IF NOT EXISTS idx_works_search ON works USING gin(to_tsvector('spanish', title || ' ' || description));

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_work_id ON comments(work_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- Likes indexes (for social features)
CREATE INDEX IF NOT EXISTS idx_likes_work_id ON likes(work_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_unique ON likes(user_id, work_id); -- Prevent duplicate likes

-- Follows indexes (for social graph)
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followed_id ON follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_follows_unique ON follows(follower_id, followed_id); -- Prevent duplicate follows

-- Notifications indexes (critical for performance)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_all ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_from_user ON notifications(from_user_id) WHERE from_user_id IS NOT NULL;

-- Bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_work_id ON bookmarks(work_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_unique ON bookmarks(user_id, work_id); -- Prevent duplicate bookmarks

-- Reading progress indexes
CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id, last_read_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_progress_work ON reading_progress(work_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_unique ON reading_progress(user_id, work_id); -- One progress per user per work

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles USING gin(to_tsvector('spanish', name || ' ' || COALESCE(bio, '')));

-- =====================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =====================================================

-- For feed generation (works by followed users)
CREATE INDEX IF NOT EXISTS idx_works_author_published_created ON works(author_id, published, created_at DESC) WHERE published = true;

-- For user activity timeline
CREATE INDEX IF NOT EXISTS idx_comments_user_created ON comments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user_created ON likes(user_id, created_at DESC);

-- For notification aggregation
CREATE INDEX IF NOT EXISTS idx_notifications_type_user_created ON notifications(type, user_id, created_at DESC);

-- =====================================================
-- PARTIAL INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Only index published works for public queries
CREATE INDEX IF NOT EXISTS idx_works_public_genre ON works(genre, created_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_works_public_search ON works USING gin(to_tsvector('spanish', title)) WHERE published = true;

-- Only index unread notifications (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_unread_only ON notifications(user_id, created_at DESC) WHERE read = false;

-- =====================================================
-- STATISTICS AND MAINTENANCE
-- =====================================================

-- Update table statistics for better query planning
ANALYZE works;
ANALYZE comments;
ANALYZE likes;
ANALYZE follows;
ANALYZE notifications;
ANALYZE bookmarks;
ANALYZE profiles;

-- =====================================================
-- CONSTRAINTS AND DATA INTEGRITY
-- =====================================================

-- Ensure foreign key constraints exist
ALTER TABLE works ADD CONSTRAINT IF NOT EXISTS fk_works_author 
    FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE comments ADD CONSTRAINT IF NOT EXISTS fk_comments_work 
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE;

ALTER TABLE comments ADD CONSTRAINT IF NOT EXISTS fk_comments_user 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE likes ADD CONSTRAINT IF NOT EXISTS fk_likes_work 
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE;

ALTER TABLE likes ADD CONSTRAINT IF NOT EXISTS fk_likes_user 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE follows ADD CONSTRAINT IF NOT EXISTS fk_follows_follower 
    FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE follows ADD CONSTRAINT IF NOT EXISTS fk_follows_followed 
    FOREIGN KEY (followed_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE notifications ADD CONSTRAINT IF NOT EXISTS fk_notifications_user 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE bookmarks ADD CONSTRAINT IF NOT EXISTS fk_bookmarks_user 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE bookmarks ADD CONSTRAINT IF NOT EXISTS fk_bookmarks_work 
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE;

-- =====================================================
-- UNIQUE CONSTRAINTS TO PREVENT DUPLICATES
-- =====================================================

-- Prevent duplicate likes
ALTER TABLE likes ADD CONSTRAINT IF NOT EXISTS uq_likes_user_work 
    UNIQUE (user_id, work_id);

-- Prevent duplicate follows
ALTER TABLE follows ADD CONSTRAINT IF NOT EXISTS uq_follows_follower_followed 
    UNIQUE (follower_id, followed_id);

-- Prevent duplicate bookmarks
ALTER TABLE bookmarks ADD CONSTRAINT IF NOT EXISTS uq_bookmarks_user_work 
    UNIQUE (user_id, work_id);

-- Prevent self-following
ALTER TABLE follows ADD CONSTRAINT IF NOT EXISTS chk_follows_not_self 
    CHECK (follower_id != followed_id);

-- =====================================================
-- PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- Set appropriate work_mem for complex queries
SET work_mem = '256MB';

-- Enable parallel query execution
SET max_parallel_workers_per_gather = 4;

-- Optimize for read-heavy workload
SET shared_preload_libraries = 'pg_stat_statements';

-- =====================================================
-- MONITORING QUERIES
-- =====================================================

-- Create a view for monitoring slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE mean_time > 100  -- Queries taking more than 100ms on average
ORDER BY mean_time DESC;

-- Create a view for monitoring table sizes
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON INDEX idx_works_author_published_created IS 'Optimizes feed generation queries';
COMMENT ON INDEX idx_notifications_unread_only IS 'Critical for notification badge performance';
COMMENT ON INDEX idx_works_search IS 'Full-text search for works in Spanish';
COMMENT ON INDEX idx_profiles_search IS 'Full-text search for user profiles';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database optimization completed successfully!';
    RAISE NOTICE '📊 Indexes created for better query performance';
    RAISE NOTICE '🔒 Constraints added for data integrity';
    RAISE NOTICE '📈 Monitoring views created for ongoing optimization';
    RAISE NOTICE '🚀 Your Palabreo database is now optimized!';
END $$;

