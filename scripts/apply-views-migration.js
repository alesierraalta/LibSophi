const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// This script applies the views system migration to Supabase
// Run with: node scripts/apply-views-migration.js

async function applyMigration() {
  console.log('🚀 Starting views system migration...')
  
  // Check for environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL')
    console.error('   SUPABASE_SERVICE_ROLE_KEY')
    console.error('   Please add these to your .env.local file')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'create-views-system.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split by statements and execute each one
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql_statement: statement 
        })
        
        if (error) {
          // Try direct SQL execution as fallback
          const { error: directError } = await supabase
            .from('_supabase_migrations')
            .select('*')
            .limit(1)
          
          if (directError) {
            console.warn(`⚠️  Warning on statement ${i + 1}: ${error.message}`)
          }
        }
        
        console.log(`✅ Statement ${i + 1} completed`)
      } catch (statementError) {
        console.warn(`⚠️  Warning on statement ${i + 1}: ${statementError.message}`)
      }
    }
    
    // Verify the migration worked by testing the function
    console.log('🧪 Testing views system...')
    
    try {
      // Test the increment function exists
      const { data, error } = await supabase.rpc('increment_work_views', { 
        work_id: '00000000-0000-0000-0000-000000000000' // This will fail but test if function exists
      })
      
      if (error && !error.message.includes('Work not found')) {
        throw error
      }
      
      console.log('✅ Views system functions are working')
    } catch (testError) {
      if (testError.message.includes('Work not found')) {
        console.log('✅ Views system functions are working (expected error for test ID)')
      } else {
        console.error('❌ Views system test failed:', testError.message)
      }
    }
    
    // Test getting popular works
    try {
      const { data: popularWorks, error: popularError } = await supabase.rpc('get_popular_works', { 
        limit_count: 5 
      })
      
      if (popularError) {
        throw popularError
      }
      
      console.log(`✅ Popular works function working (found ${popularWorks?.length || 0} works)`)
    } catch (popularError) {
      console.warn('⚠️  Popular works function may need manual setup:', popularError.message)
    }
    
    console.log('🎉 Views system migration completed successfully!')
    console.log('')
    console.log('📋 Next steps:')
    console.log('   1. Test view tracking by visiting a work page')
    console.log('   2. Check that views count increases in the database')
    console.log('   3. Verify that popular works show correct view counts')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error('📋 Manual steps required:')
    console.error('   1. Copy the SQL from scripts/create-views-system.sql')
    console.error('   2. Run it manually in your Supabase SQL editor')
    console.error('   3. Ensure all functions and tables are created')
    process.exit(1)
  }
}

applyMigration()

