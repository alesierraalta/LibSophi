#!/usr/bin/env ts-node

/**
 * Database Audit Script for Palabreo
 * Verifies that the database schema supports all application features
 */

import { getSupabaseServerClient } from '../lib/supabase/server'

interface TableInfo {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string
}

interface AuditResult {
  table: string
  exists: boolean
  columns?: string[]
  issues?: string[]
}

class DatabaseAuditor {
  private supabase = getSupabaseServerClient()
  private results: AuditResult[] = []

  // Required tables and their essential columns
  private requiredSchema = {
    profiles: [
      'id', 'username', 'name', 'bio', 'avatar_url', 'banner_url', 
      'created_at', 'updated_at'
    ],
    works: [
      'id', 'title', 'description', 'content', 'author_id', 'genre', 
      'tags', 'published', 'reading_time', 'views', 'likes', 
      'created_at', 'updated_at', 'cover_url'
    ],
    comments: [
      'id', 'work_id', 'user_id', 'content', 'parent_id', 
      'created_at', 'updated_at'
    ],
    likes: [
      'id', 'work_id', 'user_id', 'created_at'
    ],
    follows: [
      'id', 'follower_id', 'followed_id', 'created_at'
    ],
    notifications: [
      'id', 'user_id', 'type', 'title', 'body', 'read', 
      'work_id', 'from_user_id', 'created_at'
    ],
    bookmarks: [
      'id', 'user_id', 'work_id', 'created_at'
    ],
    reading_progress: [
      'id', 'user_id', 'work_id', 'progress_percentage', 
      'last_read_at', 'created_at', 'updated_at'
    ],
    genres: [
      'id', 'name', 'description', 'created_at'
    ],
    tags: [
      'id', 'name', 'created_at'
    ]
  }

  async auditTables(): Promise<void> {
    console.log('🔍 Starting database schema audit...\n')

    for (const [tableName, requiredColumns] of Object.entries(this.requiredSchema)) {
      await this.auditTable(tableName, requiredColumns)
    }

    this.printResults()
  }

  private async auditTable(tableName: string, requiredColumns: string[]): Promise<void> {
    try {
      // Check if table exists and get column information
      const { data: tableInfo, error } = await this.supabase
        .from('information_schema.columns')
        .select('table_name, column_name, data_type, is_nullable, column_default')
        .eq('table_name', tableName)
        .eq('table_schema', 'public')

      if (error) {
        console.error(`Error querying table ${tableName}:`, error)
        this.results.push({
          table: tableName,
          exists: false,
          issues: [`Query error: ${error.message}`]
        })
        return
      }

      if (!tableInfo || tableInfo.length === 0) {
        this.results.push({
          table: tableName,
          exists: false,
          issues: ['Table does not exist']
        })
        return
      }

      const existingColumns = tableInfo.map((col: TableInfo) => col.column_name)
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
      const issues: string[] = []

      if (missingColumns.length > 0) {
        issues.push(`Missing columns: ${missingColumns.join(', ')}`)
      }

      this.results.push({
        table: tableName,
        exists: true,
        columns: existingColumns,
        issues: issues.length > 0 ? issues : undefined
      })

    } catch (error) {
      console.error(`Unexpected error auditing table ${tableName}:`, error)
      this.results.push({
        table: tableName,
        exists: false,
        issues: [`Unexpected error: ${error}`]
      })
    }
  }

  private printResults(): void {
    console.log('\n📊 DATABASE AUDIT RESULTS')
    console.log('=' .repeat(50))

    let totalTables = this.results.length
    let existingTables = this.results.filter(r => r.exists).length
    let tablesWithIssues = this.results.filter(r => r.issues && r.issues.length > 0).length

    console.log(`\n📈 SUMMARY:`)
    console.log(`Total tables checked: ${totalTables}`)
    console.log(`Existing tables: ${existingTables}`)
    console.log(`Tables with issues: ${tablesWithIssues}`)
    console.log(`Health score: ${Math.round((existingTables - tablesWithIssues) / totalTables * 100)}%`)

    console.log('\n📋 DETAILED RESULTS:')

    this.results.forEach(result => {
      const status = result.exists ? 
        (result.issues ? '⚠️  EXISTS (with issues)' : '✅ EXISTS') : 
        '❌ MISSING'

      console.log(`\n${result.table}: ${status}`)
      
      if (result.columns) {
        console.log(`   Columns (${result.columns.length}): ${result.columns.join(', ')}`)
      }
      
      if (result.issues) {
        result.issues.forEach(issue => {
          console.log(`   🚨 Issue: ${issue}`)
        })
      }
    })

    console.log('\n' + '='.repeat(50))

    // Recommendations
    this.printRecommendations()
  }

  private printRecommendations(): void {
    console.log('\n💡 RECOMMENDATIONS:')

    const missingTables = this.results.filter(r => !r.exists)
    const tablesWithIssues = this.results.filter(r => r.exists && r.issues)

    if (missingTables.length > 0) {
      console.log('\n📋 Missing Tables:')
      missingTables.forEach(table => {
        console.log(`   • Create table: ${table.table}`)
        console.log(`     Required columns: ${this.requiredSchema[table.table as keyof typeof this.requiredSchema].join(', ')}`)
      })
    }

    if (tablesWithIssues.length > 0) {
      console.log('\n🔧 Tables Needing Updates:')
      tablesWithIssues.forEach(table => {
        console.log(`   • ${table.table}:`)
        table.issues?.forEach(issue => {
          console.log(`     - ${issue}`)
        })
      })
    }

    console.log('\n🚀 Next Steps:')
    console.log('   1. Create missing tables using Supabase migrations')
    console.log('   2. Add missing columns to existing tables')
    console.log('   3. Set up proper indexes for performance')
    console.log('   4. Configure Row Level Security (RLS) policies')
    console.log('   5. Run functionality tests to verify all features work')
  }

  async auditIndexes(): Promise<void> {
    console.log('\n🔍 Auditing database indexes...')

    try {
      const { data: indexes, error } = await this.supabase
        .from('pg_indexes')
        .select('tablename, indexname, indexdef')
        .eq('schemaname', 'public')

      if (error) {
        console.error('Error querying indexes:', error)
        return
      }

      console.log('\n📊 EXISTING INDEXES:')
      if (indexes && indexes.length > 0) {
        const groupedIndexes = indexes.reduce((acc: any, index: any) => {
          if (!acc[index.tablename]) {
            acc[index.tablename] = []
          }
          acc[index.tablename].push(index.indexname)
          return acc
        }, {})

        Object.entries(groupedIndexes).forEach(([table, tableIndexes]) => {
          process.stdout.write(`\n${table}:\n`)
          ;(tableIndexes as string[]).forEach(indexName => {
            process.stdout.write(`   • ${indexName}\n`)
          })
        })
      } else {
        console.log('   No custom indexes found')
      }

      // Recommend important indexes
      this.recommendIndexes()

    } catch (error) {
      console.error('Error auditing indexes:', error)
    }
  }

  private recommendIndexes(): void {
    console.log('\n💡 RECOMMENDED INDEXES:')

    const recommendedIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_works_author_id ON works(author_id);',
      'CREATE INDEX IF NOT EXISTS idx_works_published ON works(published, created_at DESC);',
      'CREATE INDEX IF NOT EXISTS idx_works_genre ON works(genre);',
      'CREATE INDEX IF NOT EXISTS idx_likes_work_id ON likes(work_id);',
      'CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_comments_work_id ON comments(work_id, created_at DESC);',
      'CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);',
      'CREATE INDEX IF NOT EXISTS idx_follows_followed ON follows(followed_id);',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);',
      'CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id, created_at DESC);'
    ]

    recommendedIndexes.forEach(sql => {
      console.log(`   ${sql}`)
    })
  }

  async auditConstraints(): Promise<void> {
    console.log('\n🔍 Auditing foreign key constraints...')

    try {
      const { data: constraints, error } = await this.supabase
        .from('information_schema.table_constraints')
        .select('table_name, constraint_name, constraint_type')
        .eq('constraint_schema', 'public')
        .eq('constraint_type', 'FOREIGN KEY')

      if (error) {
        console.error('Error querying constraints:', error)
        return
      }

      console.log('\n📊 EXISTING FOREIGN KEY CONSTRAINTS:')
      if (constraints && constraints.length > 0) {
        constraints.forEach((constraint: any) => {
          console.log(`   • ${constraint.table_name}.${constraint.constraint_name}`)
        })
      } else {
        console.log('   No foreign key constraints found')
      }

    } catch (error) {
      console.error('Error auditing constraints:', error)
    }
  }
}

// Main execution
async function main() {
  const auditor = new DatabaseAuditor()
  
  try {
    await auditor.auditTables()
    await auditor.auditIndexes()
    await auditor.auditConstraints()
    
    console.log('\n✅ Database audit completed!')
    console.log('📄 Check DATABASE_AUDIT_PLAN.md for detailed optimization plan')
    
  } catch (error) {
    console.error('❌ Audit failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { DatabaseAuditor }

