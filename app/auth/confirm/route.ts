import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  
  if (token_hash && type) {
    const supabase = getSupabaseServerClient()
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      })
      
      if (error) {
        console.error('Error confirming user:', error.message)
        // Redirect to login with error message
        return NextResponse.redirect(new URL('/login?error=confirmation_failed&message=' + encodeURIComponent(error.message), url.origin))
      }
      
      if (data.user) {
        console.log('User confirmed successfully:', data.user.email)
        
        // Ensure user has a profile (safety check)
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single()
          
          if (!existingProfile) {
            // Create profile if it doesn't exist
            const username = data.user.user_metadata?.username || 
                           `@${data.user.email?.split('@')[0] || 'usuario'}`
            const name = data.user.user_metadata?.name || 
                        data.user.email?.split('@')[0] || 'Usuario'
            
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                name: name,
                username: username,
                bio: 'Nuevo en Palabreo ✨',
                avatar_url: '/api/placeholder/112/112',
                banner_url: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
            
            console.log('Created missing profile for confirmed user:', data.user.email)
          }
        } catch (profileError) {
          console.error('Error ensuring profile exists:', profileError)
          // Don't fail confirmation because of profile error
        }
        
        // Redirect to main page with success message
        return NextResponse.redirect(new URL('/main?message=account_confirmed', url.origin))
      }
    } catch (error: any) {
      console.error('Exception during confirmation:', error.message)
      return NextResponse.redirect(new URL('/login?error=confirmation_exception', url.origin))
    }
  }
  
  // Redirect to login if no valid parameters
  return NextResponse.redirect(new URL('/login?error=invalid_confirmation_link', url.origin))
}
