'use client'

import { useActionState } from 'react'
import type { FormState } from '@/lib/forms'
import { MarkdownEditor } from './MarkdownEditor'

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  slug: string
}

export function ReplyForm({ action, slug }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="slug" value={slug} />
      <MarkdownEditor name="content" rows={6} placeholder="写下你的回复…" />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="button button-primary">
        {pending ? '提交中…' : '回复'}
      </button>
    </form>
  )
}