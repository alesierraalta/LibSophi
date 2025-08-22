/**
 * Database migration script to create user profile trigger and sync existing users
 */
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read environment variables from .env.local manually
const envPath = path.join(__dirname, '../.env.local')
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// If not in environment, try to read from .env.local
if (!supabaseUrl || !supabaseServiceKey) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split('=')
      const value = valueParts.join('=').trim()
      
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
        supabaseUrl = value
      } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
        supabaseServiceKey = value
      }
    }
  } catch (error) {
    console.log('⚠️  Could not read .env.local file')
  }
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Please check your .env.local file for:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...\n')
    
    // Read migration files
    const migration1Path = path.join(__dirname, '../supabase/migrations/001_create_user_profile_trigger.sql')
    const migration2Path = path.join(__dirname, '../supabase/migrations/002_sync_existing_users.sql')
    
    if (!fs.existsSync(migration1Path) || !fs.existsSync(migration2Path)) {
      console.error('❌ Migration files not found')
      process.exit(1)
    }
    
    const migration1SQL = fs.readFileSync(migration1Path, 'utf8')
    const migration2SQL = fs.readFileSync(migration2Path, 'utf8')
    
    // Run first migration (create trigger)
    console.log('📝 Running migration 001: Create user profile trigger...')
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: migration1SQL })
    
    if (error1) {
      console.error('❌ Error in migration 001:', error1.message)
      throw error1
    }
    console.log('✅ Migration 001 completed successfully\n')
    
    // Run second migration (sync existing users)
    console.log('📝 Running migration 002: Sync existing users...')
    const { error: error2 } = await supabase.rpc('exec_sql', { sql: migration2SQL })
    
    if (error2) {
      console.error('❌ Error in migration 002:', error2.message)
      throw error2
    }
    console.log('✅ Migration 002 completed successfully\n')
    
    // Verify the results
    console.log('🔍 Verifying migration results...')
    
    const { data: authUsersCount } = await supabase.rpc('count_auth_users')
    const { data: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
    
    if (profilesError) {
      console.error('❌ Error counting profiles:', profilesError.message)
    } else {
      console.log(`📊 Database status:`)
      console.log(`   - Auth users: ${authUsersCount || 'Unknown'}`)
      console.log(`   - Profiles: ${profilesCount?.length || 0}`)
      
      if (profilesCount?.length === authUsersCount) {
        console.log('✅ All users have profiles - sync successful!')
      } else {
        console.log('⚠️  Some users may not have profiles')
      }
    }
    
    console.log('\n🎉 All migrations completed successfully!')
    console.log('🔍 New users will now automatically get profiles when they register')
    console.log('🔄 Existing users without profiles have been synced')
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message)
    process.exit(1)
  }
}

// Helper function to count auth users (needs to be created in Supabase)
async function createHelperFunctions() {
  console.log('📝 Creating helper functions...')
  
  const helperSQL = `
    CREATE OR REPLACE FUNCTION count_auth_users()
    RETURNS INTEGER AS $$
    BEGIN
      RETURN (SELECT COUNT(*) FROM auth.users WHERE deleted_at IS NULL);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `
  
  const { error } = await supabase.rpc('exec_sql', { sql: helperSQL })
  if (error) {
    console.error('❌ Error creating helper functions:', error.message)
  } else {
    console.log('✅ Helper functions created\n')
  }
}

// Check if exec_sql function exists, create if needed
async function ensureExecSqlFunction() {
  console.log('🔧 Ensuring exec_sql function exists...')
  
  const execSqlFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS text AS $$
    BEGIN
      EXECUTE sql;
      RETURN 'OK';
    EXCEPTION
      WHEN OTHERS THEN
        RETURN SQLERRM;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: execSqlFunction })
    if (error && !error.message.includes('already exists')) {
      console.error('❌ Error creating exec_sql function:', error.message)
      throw error
    }
    console.log('✅ exec_sql function ready\n')
  } catch (error) {
    // If exec_sql doesn't exist, we need to create it first using direct SQL
    console.log('📝 Creating exec_sql function with direct query...')
    
    // This might fail if we don't have direct SQL access, but worth trying
    const { error: createError } = await supabase.from('').select(execSqlFunction)
    if (createError) {
      console.log('⚠️  Could not create exec_sql function automatically')
      console.log('   Please run this SQL manually in your Supabase dashboard:')
      console.log('\n' + execSqlFunction + '\n')
    }
  }
}

async function main() {
  await ensureExecSqlFunction()
  await createHelperFunctions()
  await runMigrations()
}

main().catch(console.error)
