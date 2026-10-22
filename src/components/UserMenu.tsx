'use client'

import Link from 'next/link'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { logoutAction } from '@/actions/auth'
import { Avatar } from './Avatar'

type Props = { user: { id: string; username: string } }

const itemClass = 'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink transition-colors hover:bg-surface-soft'

// 页头头像菜单，点击外部或按 Esc 收起
export function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="账号菜单"
        className="button h-9 gap-1 px-1.5"
      >
        <Avatar name={user.username} size="sm" />
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-fade absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-line bg-surface p-1 shadow-lift"
        >
          <p className="truncate px-2.5 py-1.5 text-xs text-muted">{user.username}</p>
          <Link role="menuitem" href={`/u/${user.id}`} onClick={close} className={itemClass}>
            <UserRound className="h-4 w-4 text-muted" />
            个人主页
          </Link>
          <div className="my-1 h-px bg-line" />
          <form action={logoutAction}>
            <button
              role="menuitem"
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-danger transition-colors hover:bg-surface-soft"
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </button>
          </form>
        </div>
      )}
    </div>
  )
}