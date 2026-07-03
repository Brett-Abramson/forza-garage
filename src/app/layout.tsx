import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import KeyboardNav from '@/components/layout/KeyboardNav'
import { NavControlsProvider } from '@/context/NavControls'
import { UnitPreferencesProvider } from '@/context/UnitPreferences'
import { getUserPreferences } from '@/server/dal/preferences'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Forza Garage',
  description: 'Track your Forza Horizon car collection',
  icons: {
    icon: '/favicon.svg',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  const serverPrefs = userId ? await getUserPreferences(userId) : null

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Apply saved theme before first paint to prevent flash of wrong theme */}
          <script
            dangerouslySetInnerHTML={{
              __html: `try{var t=localStorage.getItem('fh-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}`,
            }}
          />
        </head>
        <body className={`${inter.className} min-h-screen`}>
          <UnitPreferencesProvider serverPrefs={serverPrefs} isAuthenticated={!!userId}>
            <NavControlsProvider>
              <Nav />
              <KeyboardNav />
              {children}
              <Footer />
            </NavControlsProvider>
          </UnitPreferencesProvider>
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
