'use client'

import dynamic from 'next/dynamic'
import { useState, type CSSProperties } from 'react'

const Content = dynamic(() => import('./MarkdownEditorContent'), {
  ssr: false,
  loading: () => <div className="field min-h-40 animate-pulse text-sm text-muted">编辑器加载中…</div>,
})

type Props = {
  name: string
  defaultValue?: string
  placeholder?: string
  rows?: number
}

export function MarkdownEditor({ name, defaultValue = '', placeholder, rows = 10 }: Props) {
  const [value, setValue] = useState(defaultValue)

  return (
    <div style={{ '--editor-height': `${rows * 1.7}rem` } as CSSProperties}>
      {/* 编辑器本身不是表单控件，用隐藏域让值参与原生提交 */}
      <input type="hidden" name={name} value={value} />
      <Content markdown={value} onChange={setValue} placeholder={placeholder} />
    </div>
  )
}