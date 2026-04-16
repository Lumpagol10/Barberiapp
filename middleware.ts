import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Proteger rutas de /dashboard
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Verificar autorización en la tabla profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('authorized')
      .eq('id', session.user.id)
      .single()

    if (!profile || !profile.authorized) {
      return NextResponse.redirect(new URL('/espera', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
