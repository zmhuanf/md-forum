'use client'

import { startTransition, useActionState } from 'react'
import type { FormState } from '@/lib/forms'
import { SubmitButton } from './SubmitButton'

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
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">当前密码</span>
        <input name="current" type="password" required autoComplete="current-password" className="field" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">新密码（至少 8 位）</span>
        <input name="next" type="password" required autoComplete="new-password" className="field" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">确认新密码</span>
        <input name="confirm" type="password" required autoComplete="new-password" className="field" />
      </label>

      {state?.error && (
        <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger">{state.error}</p>
      )}
      {state?.message && (
        <p className="rounded-lg border border-accent/25 bg-accent/10 px-3 py-2 text-xs text-accent">
          {state.message}
        </p>
      )}

      <SubmitButton pending={pending}>修改密码</SubmitButton>
    </form>
  )
}