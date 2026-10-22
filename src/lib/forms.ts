import { z } from 'zod'

export const usageName = '3-20 位字母、数字、下划线或连字符'

export const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{3,20}$/, `用户名需为${usageName}`)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8, '密码至少 8 位').max(72, '密码最多 72 位'),
})

export const loginSchema = z.object({
  username: z.string().trim().min(1, '请输入用户名').transform((value) => value.toLowerCase()),
  password: z.string().min(1, '请输入密码'),
})

export const postInputSchema = z.object({
  title: z.string().trim().min(2, '标题至少 2 个字').max(120, '标题最多 120 字'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.union([z.literal(''), z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/, '链接地址只能用小写字母、数字和连字符')])),
  tags: z.string().trim().max(200, '标签过长'),
  content: z.string().trim().min(1, '内容不能为空').max(50_000, '内容最多 5 万字'),
})

export const replyInputSchema = z.object({
  content: z.string().trim().min(1, '回复不能为空').max(20_000, '回复最多 2 万字'),
})

// 逗号或空白分隔的标签串转去重数组
export const parseTags = (raw: string): string[] =>
  [...new Set(raw.split(/[,，\s]+/).map((tag) => tag.trim()).filter(Boolean))].slice(0, 8)

// 登录后只允许跳回站内路径，防止开放重定向
export const safeNext = (value: unknown) =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'

export type FormState = { error: string } | null