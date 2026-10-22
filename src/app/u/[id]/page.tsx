import type { Metadata } from 'next'
import clsx from 'clsx'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown, FileText, MessagesSquare } from 'lucide-react'
import { changePasswordAction } from '@/actions/auth'
import { Avatar } from '@/components/Avatar'
import { PasswordForm } from '@/components/PasswordForm'
import { PostCard } from '@/components/PostCard'
import { formatDate } from '@/lib/format'
import { countRepliesByAuthor, listPostsByAuthor } from '@/lib/posts'
import { getCurrentUser } from '@/lib/session'
import { getUserById, isUserId } from '@/lib/users'

export const dynamic = 'force-dynamic'

const PER_PAGE = 20

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const user = isUserId(id) ? await getUserById(id) : null
  return { title: user ? user.username : '用户不存在' }
}

export default async function UserPage({ params, searchParams }: Props) {
  const { id } = await params
  if (!isUserId(id)) notFound()

  const [profile, me] = await Promise.all([getUserById(id), getCurrentUser()])
  if (!profile) notFound()

  const page = Number((await searchParams).page) || 1
  const [list, replyCount] = await Promise.all([
    listPostsByAuthor(id, { page, pageSize: PER_PAGE }),
    countRepliesByAuthor(id),
  ])

  return (
    <div>
      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
          <Avatar name={profile.username} size="lg" />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight">{profile.username}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <span className="font-mono">ID {profile.id}</span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                加入于 {formatDate(profile.createdAt)}
              </span>
            </p>
          </div>

          <dl className="ml-auto flex gap-8">
            <div>
              <dt className="flex items-center gap-1 text-[11px] text-muted">
                <FileText className="h-3 w-3" />
                帖子
              </dt>
              <dd className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">{list.total}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-[11px] text-muted">
                <MessagesSquare className="h-3 w-3" />
                回复
              </dt>
              <dd className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">{replyCount}</dd>
            </div>
          </dl>
        </div>
      </section>

      {me?.id === id && (
        <details className="card mt-4 px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
            修改密码
            <ChevronDown className="h-4 w-4 text-muted" />
          </summary>
          <p className="mt-1.5 text-xs text-muted">修改后其它设备需要重新登录</p>
          <div className="mt-4 max-w-sm">
            <PasswordForm action={changePasswordAction} />
          </div>
        </details>
      )}

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">发布的帖子</h2>
          <span className="rounded-full border border-line px-2 py-0.5 text-[11px] tabular-nums text-muted">
            {list.total}
          </span>
        </div>

        <ul className="mt-4 space-y-3">
          {list.items.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>

        {list.items.length === 0 && (
          <div className="card mt-4 px-6 py-12 text-center">
            <FileText className="mx-auto h-6 w-6 text-muted" />
            <p className="mt-3 text-sm font-medium">还没有发过帖子</p>
            <Link href="/new" className="button button-primary mt-4">
              去发帖
            </Link>
          </div>
        )}

        {list.pages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-2 text-xs">
            <Link
              href={`/u/${id}?page=${list.page - 1}`}
              aria-disabled={list.page <= 1}
              className={clsx('button h-9 px-3', list.page <= 1 && 'pointer-events-none opacity-40')}
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </Link>
            <span className="px-2 tabular-nums text-muted">
              {list.page} / {list.pages}
            </span>
            <Link
              href={`/u/${id}?page=${list.page + 1}`}
              aria-disabled={list.page >= list.pages}
              className={clsx('button h-9 px-3', list.page >= list.pages && 'pointer-events-none opacity-40')}
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>
        )}
      </section>
    </div>
  )
}