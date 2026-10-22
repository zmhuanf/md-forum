'use client'

import { startTransition, useActionState } from 'react'
import type { FormState } from '@/lib/forms'
import { MarkdownEditor } from './MarkdownEditor'

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
      className="space-y-4"
    >
      {post && <input type="hidden" name="slug" value={post.slug} />}

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">标题</span>
        <input name="title" defaultValue={post?.title} required maxLength={120} className="field" />
      </label>

      {!post && (
        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">链接地址（可选）</span>
          <input name="slug" placeholder="留空自动生成" className="field" />
        </label>
      )}

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">标签（用逗号分隔，最多 8 个）</span>
        <input name="tags" defaultValue={post?.tags.join(', ')} className="field" />
      </label>

      {post && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="closed" defaultChecked={post.closed} />
          关闭回复
        </label>
      )}

      <MarkdownEditor name="content" defaultValue={post?.content} placeholder="写点什么…" />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending} className="button button-primary">
        {pending ? '提交中…' : post ? '保存修改' : '发表'}
      </button>
    </form>
  )
}