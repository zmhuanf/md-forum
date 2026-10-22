'use client'

import { useActionState } from 'react'
import type { FormState } from '@/lib/forms'

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  slug: string
}

export function DeletePostForm({ action, slug }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm('删除后无法恢复，确认删除这个帖子和它的全部回复？')) event.preventDefault()
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" disabled={pending} className="button text-red-600">
        {pending ? '删除中…' : '删除'}
      </button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  )
}