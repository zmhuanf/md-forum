import { verify, hash } from '@node-rs/argon2'
import { readFile } from 'node:fs/promises'
import { z } from 'zod'
import { USERS_FILE } from './paths'
import { withLock, writeFileAtomic } from './store'

const userSchema = z.object({
  username: z.string(),
  passwordHash: z.string(),
  createdAt: z.string(),
})

const fileSchema = z.object({
  users: z.array(userSchema).default([]),
})

export type User = z.infer<typeof userSchema>

const readUsers = async (): Promise<User[]> => {
  try {
    return fileSchema.parse(JSON.parse(await readFile(USERS_FILE, 'utf8'))).users
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

const writeUsers = (users: User[]) => writeFileAtomic(USERS_FILE, `${JSON.stringify({ users }, null, 2)}\n`)

// 注册新用户，用户名重复时抛错
export async function createUser(username: string, password: string) {
  await withLock('users', async () => {
    const users = await readUsers()
    if (users.some((user) => user.username === username)) throw new Error('用户名已被占用')
    users.push({ username, passwordHash: await hash(password), createdAt: new Date().toISOString() })
    await writeUsers(users)
  })
}

// 校验账号密码，用户不存在与密码错误返回同一结果
export async function verifyUser(username: string, password: string) {
  const user = (await readUsers()).find((item) => item.username === username)
  return Boolean(user && (await verify(user.passwordHash, password)))
}

export async function userExists(username: string) {
  return (await readUsers()).some((user) => user.username === username)
}