-- Add display_order column to works table for drag and drop functionality
-- This allows users to customize the order of their works in their profile

-- Add the column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='works' AND column_name='display_order') THEN
        ALTER TABLE works ADD COLUMN display_order INTEGER;
    END IF;
END $$;

-- Create an index for better performance when ordering
CREATE INDEX IF NOT EXISTS idx_works_display_order ON works(author_id, display_order);

-- Update existing works to have a display_order based on creation date
UPDATE works 
SET display_order = row_number() OVER (PARTITION BY author_id ORDER BY created_at DESC)
WHERE display_order IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN works.display_order IS 'Custom display order for works in user profile (drag and drop)';

