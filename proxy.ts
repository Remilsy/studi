import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_ROUTES  = ['/', '/etudiants', '/documents', '/entreprises', '/relances']
const PUBLIC_ROUTES = ['/login', '/inscription', '/reset-password', '/auth']

function isAdminRoute(path: string) {
  return ADMIN_ROUTES.some(r => r === '/' ? path === '/' : path === r || path.startsWith(r + '/'))
}

function isPublicRoute(path: string) {
  return PUBLIC_ROUTES.some(r => path === r || path.startsWith(r + '/'))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname)) return NextResponse.next()
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }
  if (pathname.startsWith('/station-performance')) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const role = user.user_metadata?.role

  if (isAdminRoute(pathname) && role !== 'admin') {
    return NextResponse.redirect(new URL('/profil', request.url))
  }

  if (pathname.startsWith('/profil') && role === 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
