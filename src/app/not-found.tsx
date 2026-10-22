import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface text-muted shadow-card">
        <FileQuestion className="h-6 w-6" />
      </span>
      <p className="mt-6 text-5xl font-bold tracking-tight text-accent">404</p>
      <h1 className="mt-4 text-lg font-semibold tracking-tight">页面或帖子不存在</h1>
      <p className="mt-1.5 text-sm text-muted">这个地址可能已经失效，或者内容已被删除。</p>
      <div className="mt-7 flex gap-2">
        <Link href="/" className="button button-primary">
          回到首页
        </Link>
        <Link href="/new" className="button">
          去发帖
        </Link>
      </div>
    </div>
  )
}