# Database User Sync Solution

## Problem
When users register with `supabase.auth.signUp()`, they are created in the `auth.users` table but not automatically in the `profiles` table. The search functionality queries the `profiles` table, so new users don't appear in search results.

## Solution
Automatic synchronization between `auth.users` and `profiles` tables using:

### 1. SQL Trigger (Automated)
- **File**: `supabase/migrations/001_create_user_profile_trigger.sql`
- **Purpose**: Automatically creates a profile when a user registers
- **Triggers on**: INSERT into `auth.users`

### 2. Existing User Sync (One-time)
- **File**: `supabase/migrations/002_sync_existing_users.sql` 
- **Purpose**: Creates profiles for users who registered before the trigger was set up

### 3. Confirmation Safety Check
- **File**: `app/auth/confirm/route.ts` (updated)
- **Purpose**: Ensures profile exists during email confirmation as a backup

## How to Run

### Manual SQL Execution (Recommended)
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the content of `supabase/migrations/001_create_user_profile_trigger.sql`
4. Execute the first migration
5. Copy and paste the content of `supabase/migrations/002_sync_existing_users.sql`  
6. Execute the second migration

### What Each Migration Does
- **Migration 001**: Creates the automatic trigger function and RLS policies
- **Migration 002**: Syncs any existing users who don't have profiles yet

## Expected Results
- ✅ New users automatically get profiles when registering
- ✅ Existing users without profiles get synced  
- ✅ Users appear in search results immediately after registration
- ✅ Email confirmation creates profile if missing (safety check)

## Testing
1. Register a new user
2. Confirm email
3. Search for the user by name/username
4. User should appear in search results

## Database Tables Affected
- `auth.users` (read-only, trigger listens to inserts)
- `public.profiles` (inserts/updates)
- Proper RLS policies maintained
