import { randomUUID } from 'node:crypto'
import { mkdir, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

const chains = new Map<string, Promise<unknown>>()

// 同一 key 的读改写串行执行，避免并发请求互相覆盖
export function withLock<T>(key: string, job: () => Promise<T>): Promise<T> {
  const previous = chains.get(key) ?? Promise.resolve()
  const next = previous.then(job, job)
  chains.set(
    key,
    next.catch(() => {}),
  )
  return next
}

// 先写临时文件再改名，避免读取方读到写了一半的文件
export async function writeFileAtomic(file: string, content: string) {
  await mkdir(path.dirname(file), { recursive: true })
  const temp = `${file}.${randomUUID()}.tmp`
  await writeFile(temp, content, 'utf8')
  await rename(temp, file)
}