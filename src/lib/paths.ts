import path from 'node:path'

// 数据直接放在运行目录下，备份就是复制 posts 目录与 users.json
export const POSTS_DIR = path.join(process.cwd(), 'posts')
export const USERS_FILE = path.join(process.cwd(), 'users.json')

// 帖子目录名同时作为 URL 标识，只允许小写字母数字与连字符
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/

export const isSlug = (value: string) => SLUG_RE.test(value)

// 返回帖子目录，非法标识直接拒绝以防目录穿越
export function postDir(slug: string) {
  if (!isSlug(slug)) throw new Error('非法的帖子链接')
  return path.join(POSTS_DIR, slug)
}