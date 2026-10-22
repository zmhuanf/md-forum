import { randomBytes } from 'node:crypto'
import { verify, hash } from '@node-rs/argon2'
import { readFile } from 'node:fs/promises'
import { z } from 'zod'
import { USERS_FILE } from './paths'
import { withLock, writeFileAtomic } from './store'

const USER_ID_RE = /^[0-9a-f]{8}$/

const userSchema = z.object({
  id: z.string().regex(USER_ID_RE),
  username: z.string(),
  passwordHash: z.string(),
  createdAt: z.string(),
  sessionVersion: z.number().int().default(0),
})

const fileSchema = z.object({
  users: z.array(userSchema).default([]),
})

export type User = z.infer<typeof userSchema>

export const isUserId = (value: string) => USER_ID_RE.test(value)

const readUsers = async (): Promise<User[]> => {
  try {
    return fileSchema.parse(JSON.parse(await readFile(USERS_FILE, 'utf8'))).users
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

const writeUsers = (users: User[]) => writeFileAtomic(USERS_FILE, `${JSON.stringify({ users }, null, 2)}\n`)

// 生成随机账号标识，与用户名解耦，改名不影响帖子归属
const uniqueId = (users: User[]) => {
  for (;;) {
    const id = randomBytes(4).toString('hex')
    if (!users.some((user) => user.id === id)) return id
  }
}

// 注册新用户并返回完整记录，用户名重复时抛错
export async function createUser(username: string, password: string): Promise<User> {
  return withLock('users', async () => {
    const users = await readUsers()
    if (users.some((user) => user.username === username)) throw new Error('用户名已被占用')
    const user: User = {
      id: uniqueId(users),
      username,
      passwordHash: await hash(password),
      createdAt: new Date().toISOString(),
      sessionVersion: 0,
    }
    users.push(user)
    await writeUsers(users)
    return user
  })
}

// 校验账号密码，用户不存在与密码错误返回同一结果
export async function verifyUser(username: string, password: string): Promise<User | null> {
  const user = (await readUsers()).find((item) => item.username === username)
  return user && (await verify(user.passwordHash, password)) ? user : null
}

export async function getUserById(id: string): Promise<User | null> {
  return (await readUsers()).find((user) => user.id === id) ?? null
}

// 校验旧密码后换新，并递增会话版本让其它设备上的登录失效
export async function changePassword(id: string, current: string, next: string): Promise<User> {
  return withLock('users', async () => {
    const users = await readUsers()
    const user = users.find((item) => item.id === id)
    if (!user) throw new Error('账号不存在')
    if (!(await verify(user.passwordHash, current))) throw new Error('当前密码不正确')

    const updated: User = { ...user, passwordHash: await hash(next), sessionVersion: user.sessionVersion + 1 }
    await writeUsers(users.map((item) => (item.id === id ? updated : item)))
    return updated
  })
}