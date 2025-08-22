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
