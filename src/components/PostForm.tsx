'use client'

import { startTransition, useActionState } from 'react'
import type { FormState } from '@/lib/forms'
import { MarkdownEditor } from './MarkdownEditor'
import { SubmitButton } from './SubmitButton'

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>
  post?: { slug: string; title: string; tags: string[]; content: string; closed: boolean }
}

export function PostForm({ action, post }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form
      // 手动提交，避免 action 完成后 React 重置表单清空已输入内容
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(() => formAction(formData))
      }}
      className="space-y-5"
    >
      {post && <input type="hidden" name="slug" value={post.slug} />}

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">标题</span>
        <input
          name="title"
          defaultValue={post?.title}
          required
          maxLength={120}
          placeholder="一句话说清楚要讨论什么"
          className="field"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">标签（用逗号分隔，最多 8 个）</span>
        <input name="tags" defaultValue={post?.tags.join(', ')} placeholder="前端, 随想" className="field" />
      </label>

      {post && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="closed" defaultChecked={post.closed} className="accent-brand-600" />
          关闭回复
        </label>
      )}

      <MarkdownEditor name="content" defaultValue={post?.content} placeholder="写点什么…" />

      {state?.error && (
        <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger">{state.error}</p>
      )}

      <SubmitButton pending={pending}>{post ? '保存修改' : '发表'}</SubmitButton>
    </form>
  )
}