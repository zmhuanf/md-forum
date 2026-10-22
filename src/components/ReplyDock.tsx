'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { useEffect } from 'react'
import { Drawer } from 'vaul'
import type { FormState } from '@/lib/forms'
import { ReplyForm } from './ReplyForm'

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  slug: string
  signedIn: boolean
}

export function ReplyDock({ action, slug, signedIn }: Props) {
  // 悬浮条盖住页脚，挂载期间给 body 留出等高空间
  useEffect(() => {
    document.body.style.paddingBottom = '5rem'
    return () => {
      document.body.style.paddingBottom = ''
    }
  }, [])

  return (
    <Drawer.Root>
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-2.5 sm:px-6">
          {signedIn ? (
            <Drawer.Trigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-left text-sm text-muted transition-colors hover:border-accent/50 hover:text-ink"
              >
                <Pencil className="h-4 w-4" />
                写下你的回复…
              </button>
            </Drawer.Trigger>
          ) : (
            <Link
              href={`/login?next=/p/${slug}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-ink"
            >
              登录后参与回复
            </Link>
          )}
        </div>
      </div>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl border-t border-line bg-canvas shadow-lift outline-none"
        >
          <Drawer.Title className="sr-only">回复</Drawer.Title>

          <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line" />

          {/* 抽屉会接管拖拽手势，编辑区的滚动和选词要显式排除 */}
          <div
            data-vaul-no-drag
            className="mx-auto w-full max-w-5xl overflow-y-auto px-4 pt-3 sm:px-6"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          >
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              <span>回复</span>
              <Drawer.Close asChild>
                <button type="button" className="transition-colors hover:text-ink">
                  收起
                </button>
              </Drawer.Close>
            </div>
            <ReplyForm action={action} slug={slug} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}