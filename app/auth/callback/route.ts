import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  if (code) {
    const supabase = getSupabaseServerClient()
    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch {}
  }
  const redirectTo = url.searchParams.get('next') || '/main'
  return NextResponse.redirect(new URL(redirectTo, url.origin))
}





