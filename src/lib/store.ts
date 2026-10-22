import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import lockfile from 'proper-lockfile'
import atomicWrite from 'write-file-atomic'
import { DATA_DIR } from './paths'

const LOCK_DIR = path.join(DATA_DIR, 'locks')
const chains = new Map<string, Promise<unknown>>()

// 先按 key 在进程内排队，再用文件锁保证跨进程互斥
export function withLock<T>(key: string, job: () => Promise<T>): Promise<T> {
  const run = async () => {
    const target = path.join(LOCK_DIR, key)
    await mkdir(LOCK_DIR, { recursive: true })
    await writeFile(target, '', { flag: 'a' })

    // 文件锁不是排队机制，同进程的等待交给上面的链式队列
    const release = await lockfile.lock(target, {
      stale: 20_000,
      retries: { retries: 20, minTimeout: 50, maxTimeout: 500, randomize: true },
    })
    try {
      return await job()
    } finally {
      await release()
    }
  }

  const previous = chains.get(key) ?? Promise.resolve()
  const next = previous.then(run, run)
  chains.set(
    key,
    next.catch(() => {}),
  )
  return next
}

// 先写临时文件再改名，避免读取方读到写了一半的文件
export async function writeFileAtomic(file: string, content: string) {
  await mkdir(path.dirname(file), { recursive: true })
  await atomicWrite(file, content)
}