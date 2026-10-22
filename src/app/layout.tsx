import type { Metadata } from 'next'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { ThemeProvider } from '@/components/ThemeProvider'
import { getCurrentUser } from '@/lib/session'
import './globals.css'

export const metadata: Metadata = {
  title: { default: '重峰论坛', template: '%s · 重峰论坛' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader user={user && { id: user.id, username: user.username }} />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}