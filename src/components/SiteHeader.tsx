import Link from 'next/link'
import { MessagesSquare, PenLine } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'

type Props = { user: { id: string; username: string } | null }

// 吸顶毛玻璃页头，右侧随登录态切换入口
export function SiteHeader({ user }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-2 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-[0.6rem] bg-ink text-canvas">
            <MessagesSquare className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">重峰论坛</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/new" className="button button-primary h-9 px-3">
                <PenLine className="h-4 w-4" />
                <span className="hidden sm:inline">发帖</span>
              </Link>
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <Link href="/login" className="button h-9 px-3">
                登录
              </Link>
              <Link href="/register" className="button button-primary h-9 px-3">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}