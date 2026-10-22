import { randomBytes } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import atomicWrite from 'write-file-atomic'

// 一次性迁移：给账号补 id 与会话版本，给帖子与回复补 authorId，重复执行无副作用
const DATA_DIR = path.join(process.cwd(), '.data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const POSTS_DIR = path.join(DATA_DIR, 'posts')
const USER_ID_RE = /^[0-9a-f]{8}$/

// 生成不与已有账号冲突的随机标识
const uniqueId = (taken) => {
  for (;;) {
    const id = randomBytes(4).toString('hex')
    if (!taken.has(id)) return id
  }
}

// 补齐账号 id 与会话版本，返回用户名到账号的映射
const prepareUsers = async () => {
  const data = JSON.parse(await readFile(USERS_FILE, 'utf8'))
  const taken = new Set(data.users.map((user) => user.id).filter(Boolean))
  let changed = false

  for (const user of data.users) {
    if (!USER_ID_RE.test(user.id ?? '')) {
      user.id = uniqueId(taken)
      taken.add(user.id)
      changed = true
    }
    if (!Number.isInteger(user.sessionVersion)) {
      user.sessionVersion = 0
      changed = true
    }
  }

  if (changed) await atomicWrite(USERS_FILE, `${JSON.stringify(data, null, 2)}\n`)
  return new Map(data.users.map((user) => [user.username, user]))
}

// 只读取作者字段，返回待补 authorId 的目标，已补齐的返回 null
const collect = async (file) => {
  const parsed = matter(await readFile(file, 'utf8'))
  if (parsed.data.authorId) return null
  return { file, author: parsed.data.author }
}

// 只插入一行作者标识，避免 YAML 重排改动既有 frontmatter
const addAuthorId = async (file, id) => {
  const raw = await readFile(file, 'utf8')
  const end = raw.startsWith('---') ? raw.indexOf('\n---', 3) : -1
  if (end === -1) throw new Error(`${file} 缺少 frontmatter`)
  await atomicWrite(file, `${raw.slice(0, end)}\nauthorId: ${id}${raw.slice(end)}`)
}

const targets = []
const entries = await readdir(POSTS_DIR, { withFileTypes: true }).catch(() => [])
for (const entry of entries.filter((item) => item.isDirectory())) {
  const dir = path.join(POSTS_DIR, entry.name)
  targets.push(await collect(path.join(dir, 'post.md')))
  const replies = await readdir(path.join(dir, 'replies')).catch(() => [])
  for (const name of replies.filter((item) => item.endsWith('.md') && !item.startsWith('.'))) {
    targets.push(await collect(path.join(dir, 'replies', name)))
  }
}

const pending = targets.filter(Boolean)
const users = await prepareUsers()
const unknown = pending.filter((target) => !users.has(target.author))
if (unknown.length) {
  for (const target of unknown) console.error(`${target.file} 的作者 ${target.author} 不在 users.json 中`)
  process.exit(1)
}

for (const target of pending) await addAuthorId(target.file, users.get(target.author).id)

const posts = pending.filter((target) => path.basename(target.file) === 'post.md').length
console.log(`账号已就绪 ${users.size} 个；补齐帖子 ${posts} 个、回复 ${pending.length - posts} 条`)