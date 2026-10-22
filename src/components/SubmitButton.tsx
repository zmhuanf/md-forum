'use client'

import clsx from 'clsx'
import { LoaderCircle } from 'lucide-react'

type Props = {
  pending: boolean
  children: React.ReactNode
  variant?: 'primary' | 'plain'
  className?: string
}

// 表单提交按钮，提交期间禁用并显示转圈
export function SubmitButton({ pending, children, variant = 'primary', className }: Props) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx('button', variant === 'primary' && 'button-primary', className)}
    >
      {pending && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {pending ? '提交中…' : children}
    </button>
  )
}