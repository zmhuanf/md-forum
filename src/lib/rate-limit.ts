const lastActionAt = new Map<string, number>()

// 返回剩余等待提示；未处于冷却期则记录本次操作并返回 null
export function cooldown(key: string, seconds: number): string | null {
  const now = Date.now()
  const remaining = (lastActionAt.get(key) ?? 0) + seconds * 1000 - now
  if (remaining > 0) return `操作太频繁，请 ${Math.ceil(remaining / 1000)} 秒后再试`

  lastActionAt.set(key, now)
  return null
}