import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Inicializar cliente SSR de servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 2. Obtener sesión
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = request.nextUrl.clone()

  // Evitar bucles en la página de espera
  if (url.pathname === '/espera') {
    if (!session) return NextResponse.redirect(new URL('/admin/auth', request.url))
    return response
  }

  // 3. Protección de rutas Dashboard y Verificación de Aprobación
  if (url.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/auth', request.url))
    }

    // VERIFICACIÓN DE SEGURIDAD FRANMARK DIGITAL
    const { data: profile } = await supabase
      .from('profiles')
      .select('authorized')
      .eq('id', session.user.id)
      .single()

    if (profile && !profile.authorized) {
      return NextResponse.redirect(new URL('/espera', request.url))
    }
  }

  // 4. Redirección inteligente de Home logueada
  if (url.pathname === '/' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard', '/', '/espera'],
}
