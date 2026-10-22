import type { Metadata } from 'next'
import Link from 'next/link'
import { logoutAction } from '@/actions/auth'
import { getCurrentUser } from '@/lib/session'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'md forum', template: '%s · md forum' },
  description: '一个简洁的讨论社区',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
            <Link href="/" className="font-semibold tracking-tight">
              md forum
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              {user ? (
                <>
                  <Link href="/new" className="hover:underline">
                    发帖
                  </Link>
                  <span className="text-neutral-500">{user}</span>
                  <form action={logoutAction}>
                    <button type="submit" className="text-neutral-500 hover:underline">
                      退出
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:underline">
                    登录
                  </Link>
                  <Link href="/register" className="hover:underline">
                    注册
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl px-4 py-8">{children}</main>

        <footer className="mx-auto flex w-full max-w-3xl justify-end px-4 pb-8 text-xs text-neutral-500">
          <a href="/rss.xml" className="hover:underline">
            RSS
          </a>
        </footer>
      </body>
    </html>
  )
}