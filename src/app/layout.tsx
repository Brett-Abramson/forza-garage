import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import Nav from '@/components/Nav'
import KeyboardNav from '@/components/KeyboardNav'
import { NavControlsProvider } from '@/context/NavControls'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Forza Garage',
  description: 'Track your Forza Horizon car collection',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          <NavControlsProvider>
            <Nav />
            <KeyboardNav />
            {children}
          </NavControlsProvider>
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
