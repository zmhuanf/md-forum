import { listPosts } from '@/lib/posts'

export const dynamic = 'force-dynamic'

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`)

export async function GET() {
  const site = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')
  const { items } = await listPosts({ sort: 'new', pageSize: 50 })

  const entries = items
    .map(
      (meta) => `    <item>
      <title>${escapeXml(meta.title)}</title>
      <link>${site}/p/${meta.slug}</link>
      <guid isPermaLink="true">${site}/p/${meta.slug}</guid>
      <pubDate>${new Date(meta.createdAt).toUTCString()}</pubDate>
      <author>${escapeXml(meta.author)}</author>
    </item>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>md forum</title>
    <link>${site}</link>
    <description>一个简洁的讨论社区</description>
    <language>zh-CN</language>
${entries}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  })
}