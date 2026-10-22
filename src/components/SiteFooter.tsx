import Link from 'next/link'
import { MessagesSquare } from 'lucide-react'

// 页脚：品牌、常用入口与版权
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-canvas">
            <MessagesSquare className="h-3 w-3" />
          </span>
          <span>重峰论坛</span>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/" className="transition-colors hover:text-ink">
            全部帖子
          </Link>
          <Link href="/new" className="transition-colors hover:text-ink">
            发帖
          </Link>
        </nav>

        <p>© {new Date().getFullYear()} 杭州重峰网络科技有限公司</p>
      </div>
    </footer>
  )
}