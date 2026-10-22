import { z } from 'zod'
import { renderMarkdown } from '@/lib/markdown'
import { getCurrentUser } from '@/lib/session'

const bodySchema = z.object({ markdown: z.string().max(50_000) })

export async function POST(request: Request) {
  if (!(await getCurrentUser())) return Response.json({ error: '请先登录' }, { status: 401 })

  const body = bodySchema.safeParse(await request.json().catch(() => null))
  if (!body.success) return Response.json({ error: '内容不合法' }, { status: 400 })

  return Response.json({ html: await renderMarkdown(body.data.markdown) })
}