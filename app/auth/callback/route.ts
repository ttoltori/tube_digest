import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const providerToken = data.session.provider_token
      const providerRefreshToken = data.session.provider_refresh_token

      if (providerToken) {
        await supabase
          .from('profiles')
          .update({
            youtube_access_token: providerToken,
            youtube_refresh_token: providerRefreshToken,
          })
          .eq('id', data.session.user.id)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
