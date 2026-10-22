import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { userExists } from './users'

const COOKIE_NAME = 'sid'
const MAX_AGE = 60 * 60 * 24 * 7

// 密钥缺失时直接报错，避免用默认值签发可伪造的会话
const getKey = () => {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 32) throw new Error('缺少 AUTH_SECRET，长度至少 32 位，参考 .env.example')
  return new TextEncoder().encode(secret)
}

const encode = (username: string) =>
  new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getKey())

const decode = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] })
    return typeof payload.username === 'string' ? payload.username : null
  } catch {
    return null
  }
}

// 取当前登录用户名，令牌无效或用户已删除均视为未登录
export async function getCurrentUser(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  const username = token ? await decode(token) : null
  return username && (await userExists(username)) ? username : null
}

export async function startSession(username: string) {
  ;(await cookies()).set(COOKIE_NAME, await encode(username), {
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