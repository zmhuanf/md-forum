import { randomBytes } from 'node:crypto'
import { mkdir, readdir, readFile, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'
import { excerpt } from './format'
import { POSTS_DIR, postDir } from './paths'
import { withLock, writeFileAtomic } from './store'

const POST_FILE = 'post.md'
const REPLIES_DIR = 'replies'

const frontmatterSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  authorId: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  pinned: z.boolean().default(false),
  closed: z.boolean().default(false),
})

const replySchema = z.object({
  author: z.string().min(1),
  authorId: z.string().min(1),
  createdAt: z.string(),
})

export type PostMeta = z.infer<typeof frontmatterSchema> & {
  slug: string
  replyCount: number
  lastActivity: string
}

export type Post = { meta: PostMeta; content: string }
export type PostSummary = PostMeta & { excerpt: string }
export type Reply = { id: string; author: string; authorId: string; createdAt: string; content: string }
export type ListOptions = {
  q?: string
  tag?: string
  sort?: 'active' | 'new'
  page?: number
  pageSize?: number
}

type CacheEntry = { postMtime: number; repliesMtime: number; post: Post }

// 缓存整篇正文，帖子数量在千级以内内存占用可忽略
const cache = new Map<string, CacheEntry>()

const isReplyFile = (name: string) => name.endsWith('.md') && !name.startsWith('.')

const exists = (target: string) =>
  stat(target).then(
    () => true,
    () => false,
  )

// 读取单个帖子，文件缺失或 frontmatter 不合法时返回 null
async function loadPost(slug: string): Promise<Post | null> {
  const dir = postDir(slug)
  const [fileStat, replyNames, replyStat] = await Promise.all([
    stat(path.join(dir, POST_FILE)).catch(() => null),
    readdir(path.join(dir, REPLIES_DIR)).catch(() => []),
    stat(path.join(dir, REPLIES_DIR)).catch(() => null),
  ])
  if (!fileStat) return null

  const repliesMtime = replyStat?.mtimeMs ?? 0
  const cached = cache.get(slug)
  if (cached && cached.postMtime === fileStat.mtimeMs && cached.repliesMtime === repliesMtime) return cached.post

  const parsed = matter(await readFile(path.join(dir, POST_FILE), 'utf8'))
  const data = frontmatterSchema.safeParse(parsed.data)
  if (!data.success) return null

  const createdAt = Date.parse(data.data.createdAt) || 0
  const meta: PostMeta = {
    ...data.data,
    slug,
    replyCount: replyNames.filter(isReplyFile).length,
    lastActivity: new Date(Math.max(createdAt, repliesMtime, fileStat.mtimeMs)).toISOString(),
  }
  const post: Post = { meta, content: parsed.content.trim() }
  cache.set(slug, { postMtime: fileStat.mtimeMs, repliesMtime, post })
  return post
}

// 切片后带上正文摘要，只解析当前页的帖子
const summarize = (post: Post): PostSummary => ({ ...post.meta, excerpt: excerpt(post.content, 110) })

// 列出帖子，支持关键词、标签、排序与分页
export async function listPosts({ q = '', tag = '', sort = 'active', page = 1, pageSize = 20 }: ListOptions = {}) {
  const entries = await readdir(POSTS_DIR, { withFileTypes: true }).catch(() => [])
  const loaded = await Promise.all(entries.filter((entry) => entry.isDirectory()).map((entry) => loadPost(entry.name)))
  const posts = loaded.filter((post) => post !== null)

  const keyword = q.trim().toLowerCase()
  const matched = posts.filter((post) => {
    if (tag && !post.meta.tags.includes(tag)) return false
    if (!keyword) return true
    return [post.meta.title, post.meta.author, post.meta.tags.join(' '), post.content].some((text) =>
      text.toLowerCase().includes(keyword),
    )
  })

  matched.sort((a, b) => {
    if (a.meta.pinned !== b.meta.pinned) return a.meta.pinned ? -1 : 1
    const left = sort === 'new' ? a.meta.createdAt : a.meta.lastActivity
    const right = sort === 'new' ? b.meta.createdAt : b.meta.lastActivity
    return right.localeCompare(left)
  })

  const pages = Math.max(1, Math.ceil(matched.length / pageSize))
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), pages)
  const items = matched.slice((current - 1) * pageSize, current * pageSize).map(summarize)
  const replyTotal = matched.reduce((sum, post) => sum + post.meta.replyCount, 0)
  return { items, total: matched.length, replyTotal, page: current, pages }
}

// 列出某作者的帖子，按发布时间倒序，供用户主页使用
export async function listPostsByAuthor(authorId: string, { page = 1, pageSize = 20 } = {}) {
  const entries = await readdir(POSTS_DIR, { withFileTypes: true }).catch(() => [])
  const loaded = await Promise.all(entries.filter((entry) => entry.isDirectory()).map((entry) => loadPost(entry.name)))
  const posts = loaded
    .filter((post): post is Post => post?.meta.authorId === authorId)
    .sort((a, b) => b.meta.createdAt.localeCompare(a.meta.createdAt))

  const pages = Math.max(1, Math.ceil(posts.length / pageSize))
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), pages)
  const items = posts.slice((current - 1) * pageSize, current * pageSize).map(summarize)
  return { items, total: posts.length, page: current, pages }
}

// 统计某作者发出的全部回复，供用户主页展示
export async function countRepliesByAuthor(authorId: string) {
  const entries = await readdir(POSTS_DIR, { withFileTypes: true }).catch(() => [])
  const counts = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const replies = await listReplies(entry.name)
        return replies.filter((reply) => reply.authorId === authorId).length
      }),
  )
  return counts.reduce((sum, count) => sum + count, 0)
}

export async function listTags() {
  const entries = await readdir(POSTS_DIR, { withFileTypes: true }).catch(() => [])
  const loaded = await Promise.all(entries.filter((entry) => entry.isDirectory()).map((entry) => loadPost(entry.name)))
  return [...new Set(loaded.flatMap((post) => post?.meta.tags ?? []))].sort()
}

export async function readPost(slug: string) {
  return loadPost(slug)
}

// 生成「日期-随机串」形式的目录名，确保不与已有帖子冲突
async function uniqueSlug() {
  const date = new Date().toISOString().slice(0, 10)
  for (;;) {
    const slug = `${date}-${randomBytes(3).toString('hex')}`
    if (!(await exists(postDir(slug)))) return slug
  }
}

export async function createPost(input: {
  title: string
  tags: string[]
  content: string
  author: string
  authorId: string
}): Promise<string> {
  return withLock('posts', async () => {
    const slug = await uniqueSlug()
    const front = frontmatterSchema.parse({
      title: input.title,
      author: input.author,
      authorId: input.authorId,
      createdAt: new Date().toISOString(),
      tags: input.tags,
    })

    await mkdir(path.join(postDir(slug), REPLIES_DIR), { recursive: true })
    await writeFileAtomic(path.join(postDir(slug), POST_FILE), matter.stringify(`${input.content.trim()}\n`, front))
    return slug
  })
}

export async function updatePost(
  slug: string,
  patch: { title: string; tags: string[]; content: string; closed: boolean },
  actorId: string,
) {
  await withLock('posts', async () => {
    const post = await loadPost(slug)
    if (!post) throw new Error('帖子不存在')
    if (post.meta.authorId !== actorId) throw new Error('只有作者可以编辑')

    const front = frontmatterSchema.parse({
      title: patch.title,
      author: post.meta.author,
      authorId: post.meta.authorId,
      createdAt: post.meta.createdAt,
      updatedAt: new Date().toISOString(),
      tags: patch.tags,
      pinned: post.meta.pinned,
      closed: patch.closed,
    })

    await writeFileAtomic(path.join(postDir(slug), POST_FILE), matter.stringify(`${patch.content.trim()}\n`, front))
    cache.delete(slug)
  })
}

export async function deletePost(slug: string, actorId: string) {
  await withLock('posts', async () => {
    const post = await loadPost(slug)
    if (!post) throw new Error('帖子不存在')
    if (post.meta.authorId !== actorId) throw new Error('只有作者可以删除')

    await rm(postDir(slug), { recursive: true, force: true })
    cache.delete(slug)
  })
}

export async function createReply(slug: string, content: string, author: { id: string; username: string }) {
  await withLock('posts', async () => {
    const post = await loadPost(slug)
    if (!post) throw new Error('帖子不存在')
    if (post.meta.closed) throw new Error('帖子已关闭，无法回复')

    const dir = path.join(postDir(slug), REPLIES_DIR)
    await mkdir(dir, { recursive: true })
    const seq = (await readdir(dir)).filter(isReplyFile).length + 1
    const id = `${String(seq).padStart(4, '0')}-${randomBytes(3).toString('hex')}`

    await writeFileAtomic(
      path.join(dir, `${id}.md`),
      matter.stringify(`${content.trim()}\n`, {
        author: author.username,
        authorId: author.id,
        createdAt: new Date().toISOString(),
      }),
    )
    cache.delete(slug)
  })
}

// 按文件名序号返回回复，序号与写入顺序一致
export async function listReplies(slug: string): Promise<Reply[]> {
  const dir = path.join(postDir(slug), REPLIES_DIR)
  const files = (await readdir(dir).catch(() => [])).filter(isReplyFile).sort()

  const replies = await Promise.all(
    files.map(async (file) => {
      const parsed = matter(await readFile(path.join(dir, file), 'utf8'))
      const data = replySchema.safeParse(parsed.data)
      if (!data.success) return null
      return { id: file.replace(/\.md$/, ''), ...data.data, content: parsed.content.trim() }
    }),
  )

  return replies.filter((reply) => reply !== null)
}