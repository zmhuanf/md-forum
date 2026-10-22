'use client'

import { useActionState } from 'react'
import type { FormState } from '@/lib/forms'

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  mode: 'login' | 'register'
  next: string
}

export function CredentialsForm({ action, mode, next }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">用户名</span>
        <input name="username" required autoComplete="username" className="field" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">密码{mode === 'register' && '（至少 8 位）'}</span>
        <input
          name="password"
          type="password"
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          className="field"
        />
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending} className="button button-primary">
        {pending ? '提交中…' : mode === 'login' ? '登录' : '注册并登录'}
      </button>
    </form>
  )
}