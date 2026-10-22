'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const modes = [
  { value: 'system', label: '跟随系统', icon: Monitor },
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
]

// 在跟随系统、浅色、深色之间循环切换，未挂载时按跟随系统渲染以避免水合不一致
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const index = mounted ? Math.max(0, modes.findIndex((mode) => mode.value === theme)) : 0
  const current = modes[index] ?? modes[0]!
  const next = modes[(index + 1) % modes.length] ?? modes[0]!
  const Icon = current.icon

  return (
    <button
      type="button"
      onClick={() => setTheme(next.value)}
      aria-label={`当前${current.label}主题，点击切换到${next.label}`}
      title={`当前：${current.label}，点击切换到${next.label}`}
      className="button h-9 w-9 px-0"
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}