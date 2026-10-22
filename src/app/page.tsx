import Link from 'next/link'
import { formatDate } from '@/lib/format'
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          全部帖子 <span className="text-sm font-normal text-neutral-500">{list.total}</span>
        </h1>
        <Link href="/new" className="button button-primary">
          发帖
        </Link>
      </div>

      <form action="/" method="get" className="mt-4 flex gap-2">
        <input name="q" defaultValue={q} placeholder="搜索标题、正文或作者" className="field" />
        {tag && <input type="hidden" name="tag" value={tag} />}
        <button type="submit" className="button shrink-0">
          搜索
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <Link
          href={href({ tag: '', page: 1 })}
          className={tag ? 'rounded-full border border-neutral-200 px-2 py-0.5 text-neutral-500 dark:border-neutral-800' : 'rounded-full bg-neutral-900 px-2 py-0.5 text-white dark:bg-neutral-100 dark:text-neutral-900'}
        >
          全部
        </Link>
        {tags.map((item) => (
          <Link
            key={item}
            href={href({ tag: item, page: 1 })}
            className={
              item === tag
                ? 'rounded-full bg-neutral-900 px-2 py-0.5 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'rounded-full border border-neutral-200 px-2 py-0.5 text-neutral-500 dark:border-neutral-800'
            }
          >
            {item}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex gap-4 text-xs text-neutral-500">
        <Link href={href({ sort: 'active', page: 1 })} className={sort === 'active' ? 'font-semibold text-neutral-900 dark:text-neutral-100' : ''}>
          最近活跃
        </Link>
        <Link href={href({ sort: 'new', page: 1 })} className={sort === 'new' ? 'font-semibold text-neutral-900 dark:text-neutral-100' : ''}>
          最新发布
        </Link>
      </div>

      <ul className="mt-4 border-t border-neutral-200 dark:border-neutral-800">
        {list.items.map((meta) => (
          <li key={meta.slug} className="border-b border-neutral-200 py-4 dark:border-neutral-800">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {meta.pinned && (
                    <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      置顶
                    </span>
                  )}
                  <Link href={`/p/${meta.slug}`} className="font-medium hover:underline">
                    {meta.title}
                  </Link>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span>{meta.author}</span>
                  <span>·</span>
                  <time dateTime={meta.createdAt}>{formatDate(meta.createdAt)}</time>
                  {meta.tags.map((item) => (
                    <Link key={item} href={href({ tag: item, page: 1 })} className="hover:underline">
                      #{item}
                    </Link>
                  ))}
                </div>
              </div>
              <span className="shrink-0 text-xs text-neutral-500">{meta.replyCount} 回复</span>
            </div>
          </li>
        ))}
      </ul>

      {list.items.length === 0 && <p className="py-12 text-center text-sm text-neutral-500">没有找到帖子</p>}

      {list.pages > 1 && (
        <nav className="mt-6 flex items-center justify-between text-sm">
          {list.page > 1 ? (
            <Link href={href({ page: list.page - 1 })} className="hover:underline">
              上一页
            </Link>
          ) : (
            <span />
          )}
          <span className="text-neutral-500">
            {list.page} / {list.pages}
          </span>
          {list.page < list.pages ? (
            <Link href={href({ page: list.page + 1 })} className="hover:underline">
              下一页
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  )
}