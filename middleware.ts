import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const publicPaths = ['/', '/login', '/signup', '/auth/callback', '/privacy']
  const isPublicPath = publicPaths.includes(pathname)

  // Logged out — block protected routes
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // Logged in — don't show auth pages
    if (pathname === '/login' || pathname === '/signup') {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    // Check onboarding status for app routes
    const appPaths = ['/home', '/plans', '/claims', '/records', '/terms', '/settings']
    const isAppPath = appPaths.some(p => pathname.startsWith(p))
    const isConnecting = pathname.startsWith('/onboarding/connecting')
    const isVerifying  = pathname.startsWith('/onboarding/verify')
    // Post-OAuth interstitial + error pages handle their own routing — never bounce them
    const isPostOauth  = pathname.startsWith('/onboarding/connected') || pathname.startsWith('/onboarding/connection-error')

    if (isAppPath || pathname.startsWith('/onboarding')) {
      // Skip onboarding check while on connecting/verify/interstitial — those handle their own redirects
      if (isConnecting || isVerifying || isPostOauth) return supabaseResponse

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_complete, connection_skipped')
        .eq('id', user.id)
        .single()

      // If profile row missing, let them through to onboarding to create it
      if (profileError || !profile) {
        if (isAppPath) return NextResponse.redirect(new URL('/onboarding', request.url))
        return supabaseResponse
      }

      const onboardingComplete = profile.onboarding_complete ?? false
      const connectionSkipped  = profile.connection_skipped === true

      if (!onboardingComplete && isAppPath) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      // Let completed users into /onboarding when adding another insurer (?add=true),
      // and always let skip-mode users in so they can connect for real.
      const isAddingInsurer = request.nextUrl.searchParams.get('add') === 'true'
      if (onboardingComplete && !connectionSkipped && pathname.startsWith('/onboarding') && !isAddingInsurer) {
        return NextResponse.redirect(new URL('/home', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
