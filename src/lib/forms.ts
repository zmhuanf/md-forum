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
  tags: z.string().trim().max(200, '标签过长'),
  content: z.string().trim().min(1, '内容不能为空').max(50_000, '内容最多 5 万字'),
})

export const replyInputSchema = z.object({
  content: z.string().trim().min(1, '回复不能为空').max(20_000, '回复最多 2 万字'),
})

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, '请输入当前密码').max(72, '密码最多 72 位'),
    next: z.string().min(8, '新密码至少 8 位').max(72, '新密码最多 72 位'),
    confirm: z.string().min(1, '请再次输入新密码'),
  })
  .refine((data) => data.next === data.confirm, { message: '两次输入的新密码不一致', path: ['confirm'] })

// 逗号或空白分隔的标签串转去重数组
export const parseTags = (raw: string): string[] =>
  [...new Set(raw.split(/[,，\s]+/).map((tag) => tag.trim()).filter(Boolean))].slice(0, 8)

// 登录后只允许跳回站内路径，防止开放重定向
export const safeNext = (value: unknown) =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'

export type FormState = { error?: string; message?: string } | null