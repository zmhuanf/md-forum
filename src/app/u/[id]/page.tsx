import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { changePasswordAction } from '@/actions/auth'
import { PasswordForm } from '@/components/PasswordForm'
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
      <h1 className="text-xl font-semibold">{profile.username}</h1>
      <p className="mt-1 text-xs text-neutral-500">
        ID {profile.id} · 注册于 {formatDate(profile.createdAt)} · {list.total} 帖 · {replyCount} 回复
      </p>

      {me?.id === id && (
        <section className="mt-8 max-w-sm">
          <h2 className="text-lg font-semibold">修改密码</h2>
          <p className="mt-1 text-xs text-neutral-500">修改后其它设备需要重新登录</p>
          <div className="mt-4">
            <PasswordForm action={changePasswordAction} />
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">帖子</h2>

        <ul className="mt-4 border-t border-neutral-200 dark:border-neutral-800">
          {list.items.map((meta) => (
            <li key={meta.slug} className="border-b border-neutral-200 py-3 dark:border-neutral-800">
              <div className="flex items-start justify-between gap-4">
                <Link href={`/p/${meta.slug}`} className="font-medium hover:underline">
                  {meta.title}
                </Link>
                <span className="shrink-0 text-xs text-neutral-500">{meta.replyCount} 回复</span>
              </div>
              <time dateTime={meta.createdAt} className="mt-1 block text-xs text-neutral-500">
                {formatDate(meta.createdAt)}
              </time>
            </li>
          ))}
        </ul>

        {list.items.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">还没有发过帖子</p>}

        {list.pages > 1 && (
          <nav className="mt-6 flex items-center justify-between text-sm">
            {list.page > 1 ? (
              <Link href={`/u/${id}?page=${list.page - 1}`} className="hover:underline">
                上一页
              </Link>
            ) : (
              <span />
            )}
            <span className="text-neutral-500">
              {list.page} / {list.pages}
            </span>
            {list.page < list.pages ? (
              <Link href={`/u/${id}?page=${list.page + 1}`} className="hover:underline">
                下一页
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </div>
  )
}