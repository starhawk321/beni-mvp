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

  const publicPaths = ['/', '/login', '/signup', '/auth/callback']
  const isPublicPath = publicPaths.includes(pathname)

  // Logged out — block protected routes
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // Logged in — don't show auth pages
    if (pathname === '/login' || pathname === '/signup') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check onboarding status for app routes
    const appPaths = ['/dashboard', '/plan', '/terms', '/settings']
    const isAppPath = appPaths.some(p => pathname.startsWith(p))
    const isConnecting = pathname.startsWith('/onboarding/connecting')
    const isVerifying  = pathname.startsWith('/onboarding/verify')

    if (isAppPath || pathname.startsWith('/onboarding')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', user.id)
        .single()

      const onboardingComplete = profile?.onboarding_complete ?? false

      if (!onboardingComplete && isAppPath) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      if (onboardingComplete && pathname.startsWith('/onboarding') && !isConnecting && !isVerifying) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
