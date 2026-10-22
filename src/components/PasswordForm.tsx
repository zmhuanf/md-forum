'use client'

import { startTransition, useActionState } from 'react'
import type { FormState } from '@/lib/forms'

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>
}

// 修改密码表单，校验旧密码后换新，成功后其它设备下线
export function PasswordForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form
      // 手动提交，避免 action 完成后 React 重置表单清空已输入内容
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(() => formAction(formData))
      }}
      className="space-y-4"
    >
      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">当前密码</span>
        <input name="current" type="password" required autoComplete="current-password" className="field" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">新密码（至少 8 位）</span>
        <input name="next" type="password" required autoComplete="new-password" className="field" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">确认新密码</span>
        <input name="confirm" type="password" required autoComplete="new-password" className="field" />
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.message && <p className="text-sm text-neutral-500">{state.message}</p>}

      <button type="submit" disabled={pending} className="button button-primary">
        {pending ? '提交中…' : '修改密码'}
      </button>
    </form>
  )
}