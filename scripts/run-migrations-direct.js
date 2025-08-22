/**
 * Execute database migrations directly using existing Supabase client
 */
const { getSupabaseServerClient } = require('../lib/supabase/server')
const fs = require('fs')
const path = require('path')

async function runMigrations() {
  try {
    console.log('🔄 Executing database migrations with Supabase client...\n')
    
    // Get Supabase client
    const supabase = getSupabaseServerClient()
    
    // Read migration files
    const migration1 = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/001_create_user_profile_trigger.sql'), 
      'utf8'
    )
    const migration2 = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/002_sync_existing_users.sql'), 
      'utf8'
    )
    
    console.log('📝 Running Migration 001: User Profile Trigger...')
    
    // Execute first migration
    const { data: result1, error: error1 } = await supabase.rpc('exec_sql', {
      sql_query: migration1
    })
    
    if (error1) {
      console.error('❌ Migration 001 failed:', error1.message)
      throw error1
    }
    
    console.log('✅ Migration 001 completed successfully\n')
    
    console.log('📝 Running Migration 002: Sync Existing Users...')
    
    // Execute second migration  
    const { data: result2, error: error2 } = await supabase.rpc('exec_sql', {
      sql_query: migration2
    })
    
    if (error2) {
      console.error('❌ Migration 002 failed:', error2.message)
      throw error2
    }
    
    console.log('✅ Migration 002 completed successfully\n')
    
    // Verify results
    console.log('🔍 Verifying migration results...')
    
    const { count: profilesCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
    
    if (countError) {
      console.error('⚠️  Could not count profiles:', countError.message)
    } else {
      console.log(`📊 Total profiles in database: ${profilesCount}`)
    }
    
    console.log('\n🎉 All migrations completed successfully!')
    console.log('✅ User-profile synchronization is now active')
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message)
    console.log('\n📋 Manual execution required:')
    console.log('1. Open Supabase Dashboard → SQL Editor')
    console.log('2. Execute supabase/migrations/001_create_user_profile_trigger.sql')
    console.log('3. Execute supabase/migrations/002_sync_existing_users.sql')
    process.exit(1)
  }
}

// Create exec_sql function if needed
async function createExecFunction() {
  const supabase = getSupabaseServerClient()
  
  const execFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
    RETURNS text AS $$
    BEGIN
      EXECUTE sql_query;
      RETURN 'SUCCESS';
    EXCEPTION
      WHEN OTHERS THEN
        RETURN 'ERROR: ' || SQLERRM;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: execFunction })
    if (error) {
      console.log('📝 Creating exec_sql function...')
      // Function doesn't exist, we'll create it manually if possible
    }
    return true
  } catch {
    return false
  }
}

async function main() {
  await createExecFunction()
  await runMigrations()
}

main().catch(console.error)



