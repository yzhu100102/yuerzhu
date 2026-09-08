// Gate for the client work. The Yara case study at /projects/yara is open;
// everything else here is held behind a password, and not all behind the same
// one: the two Garmin device studies share theirs, and Explore — which is still
// sitting on /projects/template — has its own. Each keeps its own cookie, so
// unlocking one does not unlock the other.
//
// `middleware` is deprecated in Next 16 and renamed to `proxy`
// (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: [
    '/projects/alpha-hunt/:path*',
    '/projects/s72/:path*',
    '/projects/template/:path*',
  ],
}

/**
 * Which password opens a given path, and the cookie that remembers it. Read
 * with literal keys, since a dynamic process.env lookup is not inlined at
 * build time.
 */
function gateFor(pathname: string) {
  if (pathname.startsWith('/projects/template')) {
    return { password: process.env.EXPLORE_PASSWORD, cookie: 'explore_access' }
  }
  return { password: process.env.PROJECT_PASSWORD, cookie: 'project_access' }
}

/**
 * What the cookie holds: a hash of the password rather than the password
 * itself, so the secret never travels back to the browser. Inlined rather than
 * shared with the route handler because proxy is documented as running apart
 * from the render code and should not lean on shared modules.
 */
async function accessToken(secret: string) {
  const data = new TextEncoder().encode(`yuerzhu:${secret}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function proxy(request: NextRequest) {
  const { password, cookie } = gateFor(request.nextUrl.pathname)

  // No password configured means the gate cannot be checked. Fail closed: an
  // unset variable must not quietly publish the work.
  if (password) {
    const supplied = request.cookies.get(cookie)?.value
    if (supplied && supplied === (await accessToken(password))) {
      return NextResponse.next()
    }
  }

  const locked = new URL('/projects/locked', request.url)
  locked.searchParams.set('next', request.nextUrl.pathname)
  if (!password) locked.searchParams.set('unset', '1')
  return NextResponse.redirect(locked)
}
