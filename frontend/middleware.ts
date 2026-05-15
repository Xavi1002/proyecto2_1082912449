import { NextRequest, NextResponse } from 'next/server'

const clientAllowedPaths = ['/my-reservations', '/profile', '/api/reservations/my']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return NextResponse.next()
  }

  const roleCookie = request.cookies.get('auth_role')?.value || ''
  const role = roleCookie.toLowerCase()

  if (role.includes('cliente')) {
    const allowed = clientAllowedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

    if (!allowed) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/my-reservations'
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
