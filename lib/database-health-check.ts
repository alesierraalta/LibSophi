/**
 * Database Health Check - Validates schema and provides recommendations
 * Run this to diagnose database issues automatically
 */

import { getSupabaseBrowserClient } from './supabase/browser'

interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error'
  table: string
  issue?: string
  recommendation?: string
}

export async function runDatabaseHealthCheck(): Promise<HealthCheckResult[]> {
  const supabase = getSupabaseBrowserClient()
  const results: HealthCheckResult[] = []

  console.log('🏥 Running database health check...')

  // Check profiles table
  try {
    await supabase.from('profiles').select('id').limit(1)
    results.push({ status: 'healthy', table: 'profiles' })
  } catch (error) {
    results.push({
      status: 'error',
      table: 'profiles',
      issue: 'Table not accessible',
      recommendation: 'Ensure profiles table exists and has proper RLS policies'
    })
  }

  // Check works table
  try {
    await supabase.from('works').select('id, author_id').limit(1)
    results.push({ status: 'healthy', table: 'works' })
  } catch (error) {
    results.push({
      status: 'error',
      table: 'works',
      issue: 'Table not accessible or missing author_id column',
      recommendation: 'Check if works table uses author_id (not user_id) column'
    })
  }

  // Check comments table schema
  try {
    await supabase.from('comments').select('id, text, author_id').limit(1)
    results.push({ status: 'healthy', table: 'comments' })
  } catch (error: any) {
    if (error.message?.includes('text')) {
      results.push({
        status: 'warning',
        table: 'comments',
        issue: 'Using legacy column names',
        recommendation: 'Update comments table: content → text, user_id → author_id'
      })
    } else {
      results.push({
        status: 'error',
        table: 'comments',
        issue: 'Table not accessible',
        recommendation: 'Ensure comments table exists with proper schema'
      })
    }
  }

  // Check follows table schema
  try {
    await supabase.from('follows').select('follower_id, followee_id').limit(1)
    results.push({ status: 'healthy', table: 'follows' })
  } catch (error: any) {
    if (error.message?.includes('followee_id')) {
      results.push({
        status: 'warning',
        table: 'follows',
        issue: 'Using legacy column names',
        recommendation: 'Update follows table: followed_id → followee_id'
      })
    } else {
      results.push({
        status: 'error',
        table: 'follows',
        issue: 'Table not accessible',
        recommendation: 'Ensure follows table exists with proper schema'
      })
    }
  }

  // Check likes table
  try {
    await supabase.from('likes').select('user_id, work_id').limit(1)
    results.push({ status: 'healthy', table: 'likes' })
  } catch (error) {
    results.push({
      status: 'error',
      table: 'likes',
      issue: 'Table not accessible',
      recommendation: 'Ensure likes table exists and has proper RLS policies'
    })
  }

  // Check work_views table (optional)
  try {
    await supabase.from('work_views').select('id').limit(1)
    results.push({ status: 'healthy', table: 'work_views' })
  } catch (error) {
    results.push({
      status: 'warning',
      table: 'work_views',
      issue: 'Optional table not found',
      recommendation: 'Create work_views table for view tracking (optional feature)'
    })
  }

  // Log results
  console.log('🏥 Database Health Check Results:')
  results.forEach(result => {
    const emoji = result.status === 'healthy' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
    console.log(`${emoji} ${result.table}: ${result.status}`)
    if (result.issue) console.log(`   Issue: ${result.issue}`)
    if (result.recommendation) console.log(`   Fix: ${result.recommendation}`)
  })

  return results
}

// Utility to generate SQL migration script based on health check
export function generateMigrationScript(healthResults: HealthCheckResult[]): string {
  let sql = '-- Auto-generated migration script based on health check\n\n'

  healthResults.forEach(result => {
    if (result.status === 'error' || result.status === 'warning') {
      switch (result.table) {
        case 'work_views':
          sql += `-- Create work_views table for analytics
CREATE TABLE IF NOT EXISTS work_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_id UUID REFERENCES works(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(work_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_work_views_work_id ON work_views(work_id);
CREATE INDEX IF NOT EXISTS idx_work_views_user_id ON work_views(user_id);

ALTER TABLE work_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert view records" ON work_views FOR INSERT WITH CHECK (true);
GRANT INSERT ON work_views TO anon, authenticated;

`
          break

        case 'comments':
          if (result.issue?.includes('legacy')) {
            sql += `-- Update comments table schema
DO $$ 
BEGIN
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'text') THEN
        ALTER TABLE comments ADD COLUMN text TEXT;
        UPDATE comments SET text = content WHERE content IS NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'author_id') THEN
        ALTER TABLE comments ADD COLUMN author_id UUID;
        UPDATE comments SET author_id = user_id WHERE user_id IS NOT NULL;
        ALTER TABLE comments ADD CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES profiles(id);
    END IF;
END $$;

`
          }
          break

        case 'follows':
          if (result.issue?.includes('legacy')) {
            sql += `-- Update follows table schema
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'follows' AND column_name = 'followee_id') THEN
        ALTER TABLE follows ADD COLUMN followee_id UUID;
        UPDATE follows SET followee_id = followed_id WHERE followed_id IS NOT NULL;
        ALTER TABLE follows ADD CONSTRAINT fk_follows_followee FOREIGN KEY (followee_id) REFERENCES profiles(id);
    END IF;
END $$;

`
          }
          break
      }
    }
  })

  return sql
}

// Simple function to run health check and log results
export async function quickHealthCheck() {
  try {
    const results = await runDatabaseHealthCheck()
    const hasIssues = results.some(r => r.status === 'error' || r.status === 'warning')
    
    if (!hasIssues) {
      console.log('🎉 Database is healthy!')
      return true
    } else {
      console.log('⚠️ Database has issues. See recommendations above.')
      const migrationScript = generateMigrationScript(results)
      console.log('📄 Generated migration script:')
      console.log(migrationScript)
      return false
    }
  } catch (error) {
    console.error('🔥 Health check failed:', error)
    return false
  }
}

// Auto-run health check in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run health check after a delay to avoid blocking initial render
  setTimeout(() => {
    quickHealthCheck()
  }, 3000)
}
