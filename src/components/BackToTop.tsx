'use client'

import clsx from 'clsx'
import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

// 滚动一段距离后出现的回顶按钮，位置避开底部回复条
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 600)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="回到顶部"
      title="回到顶部"
      className={clsx(
        'fixed bottom-24 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/90 text-muted shadow-card backdrop-blur transition-all hover:text-ink',
        visible ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  )
}