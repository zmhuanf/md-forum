import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, MessagesSquare, Pencil, Pin } from 'lucide-react'
import { deletePostAction, replyAction } from '@/actions/posts'
import { Avatar } from '@/components/Avatar'
import { BackToTop } from '@/components/BackToTop'
import { DeletePostForm } from '@/components/DeletePostForm'
import { ReadingProgress } from '@/components/ReadingProgress'
import { ReplyDock } from '@/components/ReplyDock'
import { Toc } from '@/components/Toc'
import { excerpt, formatDate, formatRelative } from '@/lib/format'
import { renderMarkdown } from '@/lib/markdown'
import { isSlug } from '@/lib/paths'
import { listReplies, readPost } from '@/lib/posts'
import { getCurrentUser } from '@/lib/session'
import { extractToc } from '@/lib/toc'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = isSlug(slug) ? await readPost(slug) : null
  if (!post) return { title: '帖子不存在' }
  return { title: post.meta.title, description: excerpt(post.content) }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  if (!isSlug(slug)) notFound()

  const [post, replies, user] = await Promise.all([readPost(slug), listReplies(slug), getCurrentUser()])
  if (!post) notFound()

  const [html, replyHtml] = await Promise.all([
    renderMarkdown(post.content),
    Promise.all(replies.map((reply) => renderMarkdown(reply.content))),
  ])
  const { meta } = post
  const isAuthor = user?.id === meta.authorId
  const toc = extractToc(post.content)

  return (
    <div>
      <ReadingProgress />

      <div
        className={
          toc.length > 1 ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-12' : undefined
        }
      >
        <div className="min-w-0">
          <nav aria-label="面包屑" className="flex items-center gap-1 text-xs text-muted">
            <Link href="/" className="transition-colors hover:text-ink">
              首页
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate">{meta.title}</span>
          </nav>

          <article className="mt-5">
            {meta.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {meta.tags.map((tag) => (
                  <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`} className="chip">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="mt-3 text-2xl font-semibold leading-snug tracking-tight sm:text-[2rem]">{meta.title}</h1>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
              <Link href={`/u/${meta.authorId}`} className="flex items-center gap-3">
                <Avatar name={meta.author} size="md" />
                <span className="text-sm">
                  <span className="block font-medium">{meta.author}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {formatDate(meta.createdAt)}
                    {meta.updatedAt && ` · 编辑于 ${formatRelative(meta.updatedAt)}`}
                  </span>
                </span>
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                {meta.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                    <Pin className="h-3 w-3" />
                    置顶
                  </span>
                )}
                {meta.closed && (
                  <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">已关闭</span>
                )}
                {isAuthor && (
                  <>
                    <Link href={`/p/${slug}/edit`} className="button h-8 px-2.5 text-xs">
                      <Pencil className="h-3.5 w-3.5" />
                      编辑
                    </Link>
                    <DeletePostForm action={deletePostAction} slug={slug} />
                  </>
                )}
              </div>
            </div>
          </article>

          <div className="prose mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />

          <section className="mt-14">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">回复</h2>
              <span className="rounded-full border border-line px-2 py-0.5 text-[11px] tabular-nums text-muted">
                {meta.replyCount}
              </span>
            </div>

            <ul className="mt-4 space-y-3">
              {replies.map((reply, index) => (
                <li key={reply.id} id={`reply-${reply.id}`} className="card card-hover p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/u/${reply.authorId}`}
                      className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent"
                    >
                      <Avatar name={reply.author} size="sm" />
                      {reply.author}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <time dateTime={reply.createdAt}>{formatRelative(reply.createdAt)}</time>
                      <span className="rounded-md bg-surface-soft px-1.5 py-0.5 font-mono text-[11px] tabular-nums">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                  <div
                    className="prose prose-compact mt-3 max-w-none"
                    dangerouslySetInnerHTML={{ __html: replyHtml[index] ?? '' }}
                  />
                </li>
              ))}
            </ul>

            {replies.length === 0 && (
              <div className="card mt-4 px-6 py-12 text-center">
                <MessagesSquare className="mx-auto h-6 w-6 text-muted" />
                <p className="mt-3 text-sm font-medium">还没有回复</p>
                <p className="mt-1 text-xs text-muted">
                  {meta.closed ? '本帖已关闭回复' : '写下第一条回复，让讨论开始'}
                </p>
              </div>
            )}
          </section>
        </div>

        {toc.length > 1 && (
          <aside className="hidden lg:block">
            <Toc items={toc} />
          </aside>
        )}
      </div>

      {!meta.closed && <ReplyDock action={replyAction} slug={slug} signedIn={Boolean(user)} />}
      <BackToTop />
    </div>
  )
}