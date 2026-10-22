'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { credentialsSchema, loginSchema, safeNext, type FormState } from '@/lib/forms'
import { cooldown } from '@/lib/rate-limit'
import { endSession, startSession } from '@/lib/session'
import { createUser, verifyUser } from '@/lib/users'

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentialsSchema.safeParse({
    username: String(formData.get('username') ?? ''),
    password: String(formData.get('password') ?? ''),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? '注册信息不合法' }

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const wait = await cooldown(`register:${ip}`, 60)
  if (wait) return { error: wait }

  try {
    await createUser(parsed.data.username, parsed.data.password)
  } catch (error) {
    return { error: error instanceof Error ? error.message : '注册失败，请重试' }
  }

  await startSession(parsed.data.username)
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

  if (!(await verifyUser(parsed.data.username, parsed.data.password))) return { error: '用户名或密码错误' }

  await startSession(parsed.data.username)
  redirect(safeNext(formData.get('next')))
}

export async function logoutAction() {
  await endSession()
  redirect('/')
}