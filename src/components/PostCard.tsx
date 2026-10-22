import Link from 'next/link'
import { Clock3, MessageSquare, Pin } from 'lucide-react'
import { formatRelative } from '@/lib/format'
import type { PostSummary } from '@/lib/posts'
import { Avatar } from './Avatar'

// 帖子列表项，首页与用户主页共用
export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="card card-hover group relative overflow-hidden p-4 sm:p-5">
      <span className="absolute inset-y-4 left-0 w-[2px] rounded-full bg-accent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {post.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                <Pin className="h-3 w-3" />
                置顶
              </span>
            )}
            <Link
              href={`/p/${post.slug}`}
              className="text-[15px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent"
            >
              {post.title}
            </Link>
            {post.closed && <span className="text-[11px] text-muted">已关闭</span>}
          </div>

          {post.excerpt && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{post.excerpt}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
            <Link href={`/u/${post.authorId}`} className="flex items-center gap-1.5 transition-colors hover:text-ink">
              <Avatar name={post.author} size="xs" />
              <span className="font-medium">{post.author}</span>
            </Link>
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {formatRelative(post.createdAt)}
            </span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="transition-colors hover:text-accent"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs text-muted">
          <span className="flex items-center gap-1 rounded-full border border-line px-2 py-0.5 tabular-nums">
            <MessageSquare className="h-3 w-3" />
            {post.replyCount}
          </span>
          <span className="hidden whitespace-nowrap sm:block">活跃 {formatRelative(post.lastActivity)}</span>
        </div>
      </div>
    </article>
  )
}