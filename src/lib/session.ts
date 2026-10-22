import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { userExists } from './users'

const COOKIE_NAME = 'sid'
const MAX_AGE = 60 * 60 * 24 * 7

type Payload = { username?: string; expiresAt?: number }

// 密钥缺失时直接报错，避免用默认值签发可伪造的会话
const getSecret = () => {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32) throw new Error('缺少 AUTH_SECRET，长度至少 32 位，参考 .env.example')
  return secret
}

const sign = (payload: string) => createHmac('sha256', getSecret()).update(payload).digest('base64url')

const encode = (username: string) => {
  const payload = Buffer.from(JSON.stringify({ username, expiresAt: Date.now() + MAX_AGE * 1000 })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

const decode = (token: string): string | null => {
  const [payload, mac] = token.split('.')
  if (!payload || !mac) return null

  const expected = sign(payload)
  const macBuffer = Buffer.from(mac)
  const expectedBuffer = Buffer.from(expected)
  if (macBuffer.length !== expectedBuffer.length || !timingSafeEqual(macBuffer, expectedBuffer)) return null

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Payload
    return data.username && (data.expiresAt ?? 0) > Date.now() ? data.username : null
  } catch {
    return null
  }
}

// 取当前登录用户名，令牌无效或用户已删除均视为未登录
export async function getCurrentUser(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  const username = token ? decode(token) : null
  return username && (await userExists(username)) ? username : null
}

export async function startSession(username: string) {
  ;(await cookies()).set(COOKIE_NAME, encode(username), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // 按对外地址判断，https 站点才加 Secure，避免本地 http 调试时 cookie 失效
    secure: (process.env.SITE_URL ?? '').startsWith('https://'),
    maxAge: MAX_AGE,
  })
}

export async function endSession() {
  ;(await cookies()).delete(COOKIE_NAME)
}