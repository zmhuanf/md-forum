'use client'

import { LoaderCircle, Trash2 } from 'lucide-react'
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
      <button
        type="submit"
        disabled={pending}
        className="button h-8 px-2.5 text-xs text-danger hover:border-danger/30 hover:bg-danger/10"
      >
        {pending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        {pending ? '删除中…' : '删除'}
      </button>
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  )
}