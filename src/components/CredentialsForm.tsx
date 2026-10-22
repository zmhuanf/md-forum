'use client'

import { startTransition, useActionState } from 'react'
import type { FormState } from '@/lib/forms'
import { SubmitButton } from './SubmitButton'

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  mode: 'login' | 'register'
  next: string
}

export function CredentialsForm({ action, mode, next }: Props) {
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
      <input type="hidden" name="next" value={next} />

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">用户名</span>
        <input name="username" required autoComplete="username" placeholder="yourname" className="field" />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">
          密码{mode === 'register' && '（至少 8 位）'}
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder="••••••••"
          className="field"
        />
      </label>

      {state?.error && (
        <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger">{state.error}</p>
      )}

      <SubmitButton pending={pending} className="w-full">
        {mode === 'login' ? '登录' : '注册并登录'}
      </SubmitButton>
    </form>
  )
}