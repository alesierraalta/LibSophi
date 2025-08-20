-- Palabreo Recommendation Algorithms
-- This script creates PostgreSQL functions for personalized content recommendations

-- =====================================================
-- COLLABORATIVE FILTERING FUNCTION
-- =====================================================

-- Function to get recommendations based on users with similar tastes
CREATE OR REPLACE FUNCTION get_collaborative_recommendations(
    target_user_id UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    work_id INTEGER,
    title TEXT,
    genre TEXT,
    author_id UUID,
    cover_url TEXT,
    created_at TIMESTAMPTZ,
    recommendation_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH user_interactions AS (
        -- Get all interactions for the target user with weights
        SELECT 
            w.id as work_id,
            3.0 as weight -- likes have highest weight
        FROM works w
        INNER JOIN likes l ON w.id = l.work_id
        WHERE l.user_id = target_user_id
        
        UNION ALL
        
        SELECT 
            w.id as work_id,
            2.0 as weight -- bookmarks have medium weight
        FROM works w
        INNER JOIN bookmarks b ON w.id = b.work_id
        WHERE b.user_id = target_user_id
        
        UNION ALL
        
        SELECT 
            w.id as work_id,
            1.0 as weight -- comments have lower weight
        FROM works w
        INNER JOIN comments c ON w.id = c.work_id
        WHERE c.user_id = target_user_id
    ),
    similar_users AS (
        -- Find users who have interacted with the same works
        SELECT 
            CASE 
                WHEN l.user_id = target_user_id THEN b.user_id
                WHEN b.user_id = target_user_id THEN l.user_id
                ELSE c.user_id
            END as similar_user_id,
            COUNT(*) as common_interactions,
            AVG(ui.weight) as avg_weight
        FROM user_interactions ui
        LEFT JOIN likes l ON ui.work_id = l.work_id
        LEFT JOIN bookmarks b ON ui.work_id = b.work_id  
        LEFT JOIN comments c ON ui.work_id = c.work_id
        WHERE (l.user_id != target_user_id OR l.user_id IS NULL)
          AND (b.user_id != target_user_id OR b.user_id IS NULL)
          AND (c.user_id != target_user_id OR c.user_id IS NULL)
          AND (l.user_id IS NOT NULL OR b.user_id IS NOT NULL OR c.user_id IS NOT NULL)
        GROUP BY similar_user_id
        HAVING COUNT(*) >= 2 -- At least 2 common interactions
        ORDER BY common_interactions DESC, avg_weight DESC
        LIMIT 50
    ),
    recommended_works AS (
        -- Get works liked by similar users that target user hasn't interacted with
        SELECT 
            w.id,
            w.title,
            w.genre,
            w.author_id,
            w.cover_url,
            w.created_at,
            SUM(
                CASE 
                    WHEN l.work_id IS NOT NULL THEN 3.0 * su.common_interactions * su.avg_weight
                    WHEN b.work_id IS NOT NULL THEN 2.0 * su.common_interactions * su.avg_weight  
                    WHEN c.work_id IS NOT NULL THEN 1.0 * su.common_interactions * su.avg_weight
                    ELSE 0.0
                END
            ) as score
        FROM similar_users su
        CROSS JOIN works w
        LEFT JOIN likes l ON w.id = l.work_id AND l.user_id = su.similar_user_id
        LEFT JOIN bookmarks b ON w.id = b.work_id AND b.user_id = su.similar_user_id
        LEFT JOIN comments c ON w.id = c.work_id AND c.user_id = su.similar_user_id
        WHERE w.author_id != target_user_id -- Exclude user's own works
          AND w.published = true
          AND (l.work_id IS NOT NULL OR b.work_id IS NOT NULL OR c.work_id IS NOT NULL)
          -- Exclude works the user has already interacted with
          AND NOT EXISTS (
              SELECT 1 FROM likes WHERE work_id = w.id AND user_id = target_user_id
          )
          AND NOT EXISTS (
              SELECT 1 FROM bookmarks WHERE work_id = w.id AND user_id = target_user_id
          )
          AND NOT EXISTS (
              SELECT 1 FROM comments WHERE work_id = w.id AND user_id = target_user_id
          )
        GROUP BY w.id, w.title, w.genre, w.author_id, w.cover_url, w.created_at
        HAVING SUM(
            CASE 
                WHEN l.work_id IS NOT NULL THEN 3.0 * su.common_interactions * su.avg_weight
                WHEN b.work_id IS NOT NULL THEN 2.0 * su.common_interactions * su.avg_weight
                WHEN c.work_id IS NOT NULL THEN 1.0 * su.common_interactions * su.avg_weight
                ELSE 0.0
            END
        ) > 0
        ORDER BY score DESC
        LIMIT limit_count
    )
    SELECT 
        rw.id,
        rw.title,
        rw.genre,
        rw.author_id,
        rw.cover_url,
        rw.created_at,
        rw.score
    FROM recommended_works rw;
END;
$$;

-- =====================================================
-- CONTENT-BASED FILTERING FUNCTION
-- =====================================================

-- Function to get recommendations based on content similarity (genre, author patterns)
CREATE OR REPLACE FUNCTION get_content_based_recommendations(
    target_user_id UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    work_id INTEGER,
    title TEXT,
    genre TEXT,
    author_id UUID,
    cover_url TEXT,
    created_at TIMESTAMPTZ,
    recommendation_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH user_preferences AS (
        -- Analyze user's genre preferences based on interactions
        SELECT 
            w.genre,
            COUNT(*) as interaction_count,
            AVG(
                CASE 
                    WHEN l.work_id IS NOT NULL THEN 3.0
                    WHEN b.work_id IS NOT NULL THEN 2.0
                    WHEN c.work_id IS NOT NULL THEN 1.0
                    ELSE 0.0
                END
            ) as avg_weight
        FROM works w
        LEFT JOIN likes l ON w.id = l.work_id AND l.user_id = target_user_id
        LEFT JOIN bookmarks b ON w.id = b.work_id AND b.user_id = target_user_id
        LEFT JOIN comments c ON w.id = c.work_id AND c.user_id = target_user_id
        WHERE (l.work_id IS NOT NULL OR b.work_id IS NOT NULL OR c.work_id IS NOT NULL)
          AND w.genre IS NOT NULL
        GROUP BY w.genre
    ),
    author_preferences AS (
        -- Analyze user's author preferences
        SELECT 
            w.author_id,
            COUNT(*) as interaction_count,
            AVG(
                CASE 
                    WHEN l.work_id IS NOT NULL THEN 3.0
                    WHEN b.work_id IS NOT NULL THEN 2.0
                    WHEN c.work_id IS NOT NULL THEN 1.0
                    ELSE 0.0
                END
            ) as avg_weight
        FROM works w
        LEFT JOIN likes l ON w.id = l.work_id AND l.user_id = target_user_id
        LEFT JOIN bookmarks b ON w.id = b.work_id AND b.user_id = target_user_id
        LEFT JOIN comments c ON w.id = c.work_id AND c.user_id = target_user_id
        WHERE (l.work_id IS NOT NULL OR b.work_id IS NOT NULL OR c.work_id IS NOT NULL)
        GROUP BY w.author_id
    ),
    content_recommendations AS (
        SELECT 
            w.id,
            w.title,
            w.genre,
            w.author_id,
            w.cover_url,
            w.created_at,
            (
                COALESCE(up.interaction_count * up.avg_weight, 0) * 0.7 + -- Genre preference weight
                COALESCE(ap.interaction_count * ap.avg_weight, 0) * 0.3 +  -- Author preference weight
                (w.likes::FLOAT / GREATEST(w.views, 1)) * 10 +              -- Popularity boost
                (EXTRACT(EPOCH FROM (NOW() - w.created_at)) / 86400 * -0.1) -- Recency boost (newer is better)
            ) as score
        FROM works w
        LEFT JOIN user_preferences up ON w.genre = up.genre
        LEFT JOIN author_preferences ap ON w.author_id = ap.author_id
        WHERE w.author_id != target_user_id -- Exclude user's own works
          AND w.published = true
          -- Exclude works the user has already interacted with
          AND NOT EXISTS (
              SELECT 1 FROM likes WHERE work_id = w.id AND user_id = target_user_id
          )
          AND NOT EXISTS (
              SELECT 1 FROM bookmarks WHERE work_id = w.id AND user_id = target_user_id
          )
          AND NOT EXISTS (
              SELECT 1 FROM comments WHERE work_id = w.id AND user_id = target_user_id
          )
          -- Only recommend if there's some preference match or high popularity
          AND (up.genre IS NOT NULL OR ap.author_id IS NOT NULL OR w.likes > 5)
        ORDER BY score DESC
        LIMIT limit_count
    )
    SELECT 
        cr.id,
        cr.title,
        cr.genre,
        cr.author_id,
        cr.cover_url,
        cr.created_at,
        cr.score
    FROM content_recommendations cr;
END;
$$;

-- =====================================================
-- HYBRID RECOMMENDATION FUNCTION
-- =====================================================

-- Function that combines collaborative and content-based filtering
CREATE OR REPLACE FUNCTION get_hybrid_recommendations(
    target_user_id UUID,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    work_id INTEGER,
    title TEXT,
    genre TEXT,
    author_id UUID,
    cover_url TEXT,
    created_at TIMESTAMPTZ,
    recommendation_score FLOAT,
    recommendation_type TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH collaborative_recs AS (
        SELECT 
            work_id,
            title,
            genre,
            author_id,
            cover_url,
            created_at,
            recommendation_score * 0.6 as score, -- 60% weight for collaborative
            'collaborative' as rec_type
        FROM get_collaborative_recommendations(target_user_id, limit_count)
    ),
    content_recs AS (
        SELECT 
            work_id,
            title,
            genre,
            author_id,
            cover_url,
            created_at,
            recommendation_score * 0.4 as score, -- 40% weight for content-based
            'content_based' as rec_type
        FROM get_content_based_recommendations(target_user_id, limit_count)
    ),
    combined_recs AS (
        SELECT * FROM collaborative_recs
        UNION ALL
        SELECT * FROM content_recs
    ),
    final_recs AS (
        SELECT 
            work_id,
            title,
            genre,
            author_id,
            cover_url,
            created_at,
            SUM(score) as final_score,
            STRING_AGG(rec_type, '+') as combined_type
        FROM combined_recs
        GROUP BY work_id, title, genre, author_id, cover_url, created_at
        ORDER BY final_score DESC
        LIMIT limit_count
    )
    SELECT 
        fr.work_id,
        fr.title,
        fr.genre,
        fr.author_id,
        fr.cover_url,
        fr.created_at,
        fr.final_score,
        fr.combined_type
    FROM final_recs fr;
END;
$$;

-- =====================================================
-- FALLBACK RECOMMENDATION FUNCTION
-- =====================================================

-- Function for new users or when personalized recommendations are insufficient
CREATE OR REPLACE FUNCTION get_popular_recommendations(
    target_user_id UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    work_id INTEGER,
    title TEXT,
    genre TEXT,
    author_id UUID,
    cover_url TEXT,
    created_at TIMESTAMPTZ,
    recommendation_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.title,
        w.genre,
        w.author_id,
        w.cover_url,
        w.created_at,
        (
            w.likes::FLOAT * 3.0 +
            w.views::FLOAT * 0.1 +
            (SELECT COUNT(*) FROM comments WHERE work_id = w.id) * 2.0 +
            (EXTRACT(EPOCH FROM (NOW() - w.created_at)) / 86400 * -0.05) -- Slight recency boost
        ) as score
    FROM works w
    WHERE w.published = true
      AND (target_user_id IS NULL OR w.author_id != target_user_id) -- Exclude user's own works if user provided
      AND (
          target_user_id IS NULL OR NOT EXISTS (
              SELECT 1 FROM likes WHERE work_id = w.id AND user_id = target_user_id
          )
      )
      AND (
          target_user_id IS NULL OR NOT EXISTS (
              SELECT 1 FROM bookmarks WHERE work_id = w.id AND user_id = target_user_id
          )
      )
    ORDER BY score DESC
    LIMIT limit_count;
END;
$$;

-- =====================================================
-- MAIN RECOMMENDATION FUNCTION
-- =====================================================

-- Main function that intelligently chooses the best recommendation strategy
CREATE OR REPLACE FUNCTION get_smart_recommendations(
    target_user_id UUID,
    page_type TEXT DEFAULT 'explore', -- 'explore' or 'main'
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    work_id INTEGER,
    title TEXT,
    genre TEXT,
    author_id UUID,
    cover_url TEXT,
    created_at TIMESTAMPTZ,
    recommendation_score FLOAT,
    recommendation_type TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    user_interaction_count INTEGER;
BEGIN
    -- Check how many interactions the user has
    SELECT COUNT(*) INTO user_interaction_count
    FROM (
        SELECT work_id FROM likes WHERE user_id = target_user_id
        UNION
        SELECT work_id FROM bookmarks WHERE user_id = target_user_id
        UNION
        SELECT work_id FROM comments WHERE user_id = target_user_id
    ) user_interactions;

    -- Choose recommendation strategy based on user activity level
    IF user_interaction_count >= 10 THEN
        -- Experienced user: use hybrid recommendations
        RETURN QUERY
        SELECT 
            hr.work_id,
            hr.title,
            hr.genre,
            hr.author_id,
            hr.cover_url,
            hr.created_at,
            hr.recommendation_score,
            hr.recommendation_type
        FROM get_hybrid_recommendations(target_user_id, limit_count) hr;
    ELSIF user_interaction_count >= 3 THEN
        -- Moderate user: use content-based recommendations
        RETURN QUERY
        SELECT 
            cbr.work_id,
            cbr.title,
            cbr.genre,
            cbr.author_id,
            cbr.cover_url,
            cbr.created_at,
            cbr.recommendation_score,
            'content_based' as recommendation_type
        FROM get_content_based_recommendations(target_user_id, limit_count) cbr;
    ELSE
        -- New user: use popular recommendations
        RETURN QUERY
        SELECT 
            pr.work_id,
            pr.title,
            pr.genre,
            pr.author_id,
            pr.cover_url,
            pr.created_at,
            pr.recommendation_score,
            'popular' as recommendation_type
        FROM get_popular_recommendations(target_user_id, limit_count) pr;
    END IF;
END;
$$;

-- =====================================================
-- INDEXES FOR RECOMMENDATION PERFORMANCE
-- =====================================================

-- Additional indexes to optimize recommendation queries
CREATE INDEX IF NOT EXISTS idx_likes_user_work ON likes(user_id, work_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_work ON bookmarks(user_id, work_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_work ON comments(user_id, work_id);
CREATE INDEX IF NOT EXISTS idx_works_published_likes ON works(published, likes DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_works_genre_published ON works(genre, published, created_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_works_author_published ON works(author_id, published, created_at DESC) WHERE published = true;

-- Update statistics for better query planning
ANALYZE works;
ANALYZE likes;
ANALYZE bookmarks;
ANALYZE comments;
ANALYZE profiles;
