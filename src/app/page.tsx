import clsx from 'clsx'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, FileSearch, Layers, Search } from 'lucide-react'
import { PostCard } from '@/components/PostCard'
import { listPosts, listTags } from '@/lib/posts'

export const dynamic = 'force-dynamic'

const PER_PAGE = 20

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// 同名参数重复出现时取第一个，避免数组进入后续字符串处理
const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? (value[0] ?? '') : (value ?? ''))

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams
  const q = pick(params.q).trim()
  const tag = pick(params.tag).trim()
  const sort = pick(params.sort) === 'new' ? 'new' : 'active'
  const requestedPage = Number(pick(params.page)) || 1

  const [list, tags] = await Promise.all([
    listPosts({ q, tag, sort, page: requestedPage, pageSize: PER_PAGE }),
    listTags(),
  ])

  const href = (patch: Record<string, string | number>) => {
    const search = new URLSearchParams()
    const merged = { q, tag, sort, page: list.page, ...patch }
    for (const [key, value] of Object.entries(merged)) {
      if (value !== '') search.set(key, String(value))
    }
    return `/?${search.toString()}`
  }

  const filtering = Boolean(q || tag)

  return (
    <div>
      <section className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface px-5 py-10 shadow-card sm:px-10 sm:py-14">
        <div className="grid-glow absolute inset-0 -z-10" />

        <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight sm:text-[2.6rem]">
          把想法写成帖子{' '}
          <br className="hidden sm:block" />
          让讨论留在这里
        </h1>

        <form
          action="/"
          method="get"
          className="mt-7 flex max-w-xl items-center gap-2 rounded-2xl border border-line bg-surface p-1.5 shadow-card transition-colors focus-within:border-accent/60"
        >
          <Search className="ml-2 h-4 w-4 shrink-0 text-muted" />
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索标题、正文或作者"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted"
          />
          {tag && <input type="hidden" name="tag" value={tag} />}
          <button type="submit" className="button button-primary h-8 px-3.5 text-xs">
            搜索
          </button>
        </form>

        <dl className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4">
          {[
            { label: filtering ? '匹配帖子' : '帖子', value: list.total },
            { label: '回复', value: list.replyTotal },
            { label: '标签', value: tags.length },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="text-[11px] text-muted">{stat.label}</dt>
              <dd className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link href={href({ tag: '', page: 1 })} className={clsx('chip', !tag && 'chip-active')}>
            <Layers className="h-3 w-3" />
            全部
          </Link>
          {tags.map((item) => (
            <Link key={item} href={href({ tag: item, page: 1 })} className={clsx('chip', item === tag && 'chip-active')}>
              #{item}
            </Link>
          ))}
        </div>

        <div className="flex items-center rounded-full border border-line bg-surface p-0.5 text-xs">
          {[
            { value: 'active', label: '最近活跃' },
            { value: 'new', label: '最新发布' },
          ].map((option) => (
            <Link
              key={option.value}
              href={href({ sort: option.value, page: 1 })}
              className={clsx(
                'rounded-full px-3 py-1.5 transition-colors',
                sort === option.value ? 'bg-ink font-medium text-canvas' : 'text-muted hover:text-ink',
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {list.items.map((post, index) => (
          <li key={post.slug} className="animate-rise" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>

      {list.items.length === 0 && (
        <div className="card mt-4 flex flex-col items-center gap-2 px-6 py-16 text-center">
          <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-soft text-muted">
            <FileSearch className="h-6 w-6" />
          </span>
          <p className="text-sm font-medium">{filtering ? '没有找到相关帖子' : '还没有帖子'}</p>
          <p className="text-xs text-muted">{filtering ? '换个关键词或标签再试试' : '发第一篇帖子，把话题开起来'}</p>
          <Link href={filtering ? '/' : '/new'} className="button button-primary mt-3">
            {filtering ? '查看全部帖子' : '去发帖'}
          </Link>
        </div>
      )}

      {list.pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2 text-xs">
          <Link
            href={href({ page: list.page - 1 })}
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
            href={href({ page: list.page + 1 })}
            aria-disabled={list.page >= list.pages}
            className={clsx('button h-9 px-3', list.page >= list.pages && 'pointer-events-none opacity-40')}
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Link>
        </nav>
      )}
    </div>
  )
}