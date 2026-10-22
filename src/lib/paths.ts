import path from 'node:path'

// 数据统一放在运行目录的 .data 下，备份就是复制这个目录
export const DATA_DIR = path.join(process.cwd(), '.data')
export const POSTS_DIR = path.join(DATA_DIR, 'posts')
export const USERS_FILE = path.join(DATA_DIR, 'users.json')

// 帖子目录名同时作为 URL 标识，只允许小写字母数字与连字符
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/

export const isSlug = (value: string) => SLUG_RE.test(value)

// 返回帖子目录，非法标识直接拒绝以防目录穿越
export function postDir(slug: string) {
  if (!isSlug(slug)) throw new Error('非法的帖子链接')
  return path.join(POSTS_DIR, slug)
}