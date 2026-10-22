'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/toc'

// 文章右侧目录，滚动时高亮当前所在的标题
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState('')

  useEffect(() => {
    const update = () => {
      let current = ''
      for (const item of items) {
        const heading = document.getElementById(item.id)
        // 88px 约等于吸顶页头高度，越过它的最后一个标题就是当前位置
        if (heading && heading.getBoundingClientRect().top <= 88) current = item.id
      }
      setActive(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [items])

  return (
    <nav aria-label="目录" className="sticky top-24">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">目录</p>
      <ul className="space-y-0.5 border-l border-line text-[13px]">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={clsx(
                '-ml-px block border-l-2 py-1 transition-colors',
                item.level === 1 ? 'pl-3' : item.level === 2 ? 'pl-4' : 'pl-7',
                active === item.id
                  ? 'border-accent font-medium text-ink'
                  : 'border-transparent text-muted hover:text-ink',
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}