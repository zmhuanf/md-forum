import { Feed } from 'feed'
import { listPosts } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export async function GET() {
  const site = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')
  const { items } = await listPosts({ sort: 'new', pageSize: 50 })

  const feed = new Feed({
    title: 'md forum',
    description: '一个简洁的讨论社区',
    id: site,
    link: site,
    language: 'zh-CN',
    updated: new Date(items[0]?.createdAt ?? Date.now()),
    feedLinks: { rss2: `${site}/rss.xml` },
    author: { name: 'md forum', link: site },
  })

  for (const meta of items) {
    feed.addItem({
      title: meta.title,
      id: `${site}/p/${meta.slug}`,
      link: `${site}/p/${meta.slug}`,
      date: new Date(meta.createdAt),
      author: [{ name: meta.author }],
    })
  }

  return new Response(feed.rss2(), {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  })
}