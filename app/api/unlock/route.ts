// Checks the password and, if it matches, hands back the cookie the proxy looks
// for. The password is compared here on the server and never sent to the client.

import { NextResponse } from 'next/server'

async function accessToken(secret: string) {
  const data = new TextEncoder().encode(`yuerzhu:${secret}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Only ever redirect back into this site, never to a URL a visitor supplied. */
function safeNext(value: string) {
  return value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export async function POST(request: Request) {
  const form = await request.formData()
  const supplied = String(form.get('password') ?? '')
  const next = safeNext(String(form.get('next') ?? '/'))
  const password = process.env.PROJECT_PASSWORD

  if (!password || supplied !== password) {
    const locked = new URL('/projects/locked', request.url)
    locked.searchParams.set('next', next)
    locked.searchParams.set('error', '1')
    return NextResponse.redirect(locked, 303)
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303)
  response.cookies.set('project_access', await accessToken(password), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
