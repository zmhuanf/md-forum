import { RateLimiterMemory, type RateLimiterRes } from 'rate-limiter-flexible'

const limiters = new Map<number, RateLimiterMemory>()

// 返回剩余等待提示；未处于冷却期则记录本次操作并返回 null
export async function cooldown(key: string, seconds: number): Promise<string | null> {
  const limiter = limiters.get(seconds) ?? new RateLimiterMemory({ points: 1, duration: seconds })
  limiters.set(seconds, limiter)

  try {
    await limiter.consume(key)
    return null
  } catch (rejection) {
    const wait = Math.ceil((rejection as RateLimiterRes).msBeforeNext / 1000)
    return `操作太频繁，请 ${wait} 秒后再试`
  }
}