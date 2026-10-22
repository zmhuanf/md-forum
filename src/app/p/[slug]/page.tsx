import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { deletePostAction, replyAction } from '@/actions/posts'
import { DeletePostForm } from '@/components/DeletePostForm'
import { ReplyDock } from '@/components/ReplyDock'
import { excerpt, formatDate } from '@/lib/format'
import { renderMarkdown } from '@/lib/markdown'
import { isSlug } from '@/lib/paths'
import { listReplies, readPost } from '@/lib/posts'
import { getCurrentUser } from '@/lib/session'

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

  const [html, replyHtml] = await Promise.all([renderMarkdown(post.content), Promise.all(replies.map((reply) => renderMarkdown(reply.content)))])
  const { meta } = post
  const isAuthor = user === meta.author

  return (
    <div>
      <article>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold leading-snug">{meta.title}</h1>
          {isAuthor && (
            <div className="flex shrink-0 items-center gap-2 text-xs">
              <Link href={`/p/${slug}/edit`} className="button">
                编辑
              </Link>
              <DeletePostForm action={deletePostAction} slug={slug} />
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span>{meta.author}</span>
          <span>·</span>
          <time dateTime={meta.createdAt}>{formatDate(meta.createdAt)}</time>
          {meta.updatedAt && <span>（编辑于 {formatDate(meta.updatedAt)}）</span>}
          {meta.pinned && (
            <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              置顶
            </span>
          )}
          {meta.closed && (
            <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              已关闭
            </span>
          )}
          {meta.tags.map((tag) => (
            <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`} className="hover:underline">
              #{tag}
            </Link>
          ))}
        </div>

        <div className="prose mt-6 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">回复（{meta.replyCount}）</h2>

        <ul className="mt-4 space-y-3">
          {replies.map((reply, index) => (
            <li key={reply.id} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{reply.author}</span>
                <time dateTime={reply.createdAt}>{formatDate(reply.createdAt)}</time>
                <span>#{index + 1}</span>
              </div>
              <div className="prose mt-2 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: replyHtml[index] ?? '' }} />
            </li>
          ))}
        </ul>

        {replies.length === 0 && <p className="mt-4 text-sm text-neutral-500">还没有回复</p>}
      </section>

      {!meta.closed && <ReplyDock action={replyAction} slug={slug} signedIn={Boolean(user)} />}
    </div>
  )
}