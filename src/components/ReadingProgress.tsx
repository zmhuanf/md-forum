'use client'

import { useEffect, useState } from 'react'

// 顶部阅读进度条，滚动时按比例缩放整条渐变线
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent transition-transform duration-150"
      style={{ transform: `scaleX(${progress})` }}
    />
  )
}