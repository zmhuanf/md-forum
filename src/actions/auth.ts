'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { credentialsSchema, loginSchema, passwordChangeSchema, safeNext, type FormState } from '@/lib/forms'
import { cooldown } from '@/lib/rate-limit'
import { endSession, getCurrentUser, startSession } from '@/lib/session'
import { changePassword, createUser, verifyUser, type User } from '@/lib/users'

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentialsSchema.safeParse({
    username: String(formData.get('username') ?? ''),
    password: String(formData.get('password') ?? ''),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? '注册信息不合法' }

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const wait = await cooldown(`register:${ip}`, 60)
  if (wait) return { error: wait }

  let user: User
  try {
    user = await createUser(parsed.data.username, parsed.data.password)
  } catch (error) {
    return { error: error instanceof Error ? error.message : '注册失败，请重试' }
  }

  await startSession(user)
  redirect(safeNext(formData.get('next')))
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    username: String(formData.get('username') ?? ''),
    password: String(formData.get('password') ?? ''),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? '登录信息不合法' }

  const wait = await cooldown(`login:${parsed.data.username}`, 3)
  if (wait) return { error: wait }

  const user = await verifyUser(parsed.data.username, parsed.data.password)
  if (!user) return { error: '用户名或密码错误' }

  await startSession(user)
  redirect(safeNext(formData.get('next')))
}

// 改密码后会话版本递增，需重新签发当前设备令牌，否则自己也会被踢下线
export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) return { error: '请先登录' }

  const parsed = passwordChangeSchema.safeParse({
    current: String(formData.get('current') ?? ''),
    next: String(formData.get('next') ?? ''),
    confirm: String(formData.get('confirm') ?? ''),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? '密码不合法' }

  const wait = await cooldown(`password:${user.id}`, 10)
  if (wait) return { error: wait }

  try {
    const updated = await changePassword(user.id, parsed.data.current, parsed.data.next)
    await startSession(updated)
  } catch (error) {
    return { error: error instanceof Error ? error.message : '修改失败，请重试' }
  }

  return { message: '密码已修改，其它设备已退出登录' }
}

export async function logoutAction() {
  await endSession()
  redirect('/')
}