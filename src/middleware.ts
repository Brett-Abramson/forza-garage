import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtected = createRouteMatcher(['/garage(.*)', '/api/garage(.*)'])

// Dev-only escape hatch: SKIP_AUTH_FOR_PREVIEW=true skips the sign-in redirect so
// localhost-only preview/automation browsers can load protected routes without a
// Clerk session. clerkMiddleware still runs (so server-side auth() works and just
// returns a null userId); only the gate is bypassed. Never active outside dev.
const skipAuth =
  process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH_FOR_PREVIEW === 'true'

export default clerkMiddleware(async (auth, req) => {
  if (!skipAuth && isProtected(req)) {
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
