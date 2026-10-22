'use client'

import { startTransition, useActionState } from 'react'
import type { FormState } from '@/lib/forms'
import { MarkdownEditor } from './MarkdownEditor'
import { SubmitButton } from './SubmitButton'

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  slug: string
}

export function ReplyForm({ action, slug }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form
      // 手动提交，避免 action 完成后 React 重置表单清空已输入内容
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(() => formAction(formData))
      }}
      className="space-y-3"
    >
      <input type="hidden" name="slug" value={slug} />

      <MarkdownEditor name="content" rows={6} placeholder="写下你的回复…" />

      {state?.error && (
        <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger">{state.error}</p>
      )}

      <SubmitButton pending={pending} className="w-full">
        回复
      </SubmitButton>
    </form>
  )
}