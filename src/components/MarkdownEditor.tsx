'use client'

import { useState } from 'react'

type Props = {
  name: string
  defaultValue?: string
  placeholder?: string
  rows?: number
}

export function MarkdownEditor({ name, defaultValue = '', placeholder, rows = 14 }: Props) {
  const [value, setValue] = useState(defaultValue)
  const [previewed, setPreviewed] = useState<string | null>('')
  const [html, setHtml] = useState('')
  const [mode, setMode] = useState<'write' | 'preview'>('write')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const showPreview = async () => {
    setMode('preview')
    if (previewed === value) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ markdown: value }),
      })
      const data = (await response.json()) as { html?: string; error?: string }
      if (!response.ok || data.html === undefined) throw new Error(data.error ?? '预览失败')
      setHtml(data.html)
      setPreviewed(value)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '预览失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setMode('write')}
          className={mode === 'write' ? 'font-semibold' : 'text-neutral-500'}
        >
          编写
        </button>
        <button
          type="button"
          onClick={showPreview}
          className={mode === 'preview' ? 'font-semibold' : 'text-neutral-500'}
        >
          预览
        </button>
        <span className="text-neutral-400">支持 Markdown</span>
      </div>

      <textarea
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`field font-mono text-sm ${mode === 'write' ? '' : 'hidden'}`}
      />

      {mode === 'preview' && (
        <div className="min-h-32 rounded-lg border px-4 py-3" style={{ borderColor: 'var(--line)' }}>
          {loading && <p className="text-sm text-neutral-500">渲染中…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && html ? (
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            !loading && !error && <p className="text-sm text-neutral-500">没有内容</p>
          )}
        </div>
      )}
    </div>
  )
}