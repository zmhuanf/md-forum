'use client'

import Link from 'next/link'
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
    document.body.classList.add('pb-20')
    return () => document.body.classList.remove('pb-20')
  }, [])

  return (
    <Drawer.Root>
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-2">
          {signedIn ? (
            <Drawer.Trigger asChild>
              <button
                type="button"
                className="w-full rounded-lg border px-3 py-2 text-left text-sm text-neutral-500 hover:border-neutral-400"
                style={{ borderColor: 'var(--line)' }}
              >
                写下你的回复…
              </button>
            </Drawer.Trigger>
          ) : (
            <Link href={`/login?next=/p/${slug}`} className="block py-2 text-sm text-neutral-500 hover:underline">
              登录后回复
            </Link>
          )}
        </div>
      </div>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
        >
          <Drawer.Title className="sr-only">回复</Drawer.Title>
          {/* 抽屉会接管拖拽手势，编辑区的滚动和选词要显式排除 */}
          <div
            data-vaul-no-drag
            className="mx-auto w-full max-w-3xl overflow-y-auto px-4 pt-3"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          >
            <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
              <span>回复</span>
              <Drawer.Close asChild>
                <button type="button" className="hover:underline">
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