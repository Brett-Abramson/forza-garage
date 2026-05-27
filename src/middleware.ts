import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtected = createRouteMatcher(['/garage(.*)', '/api/garage(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
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
