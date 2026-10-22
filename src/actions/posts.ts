'use server'

import { redirect } from 'next/navigation'
import { parseTags, postInputSchema, replyInputSchema, type FormState } from '@/lib/forms'
import { createPost, createReply, deletePost, updatePost } from '@/lib/posts'
import { getCurrentUser } from '@/lib/session'
import { cooldown } from '@/lib/rate-limit'

export async function createPostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) return { error: '请先登录' }

  const parsed = postInputSchema.safeParse({
    title: String(formData.get('title') ?? ''),
    tags: String(formData.get('tags') ?? ''),
    content: String(formData.get('content') ?? ''),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? '内容不合法' }

  const wait = await cooldown(`post:${user}`, 30)
  if (wait) return { error: wait }

  let slug: string
  try {
    slug = await createPost({
      title: parsed.data.title,
      tags: parseTags(parsed.data.tags),
      content: parsed.data.content,
      author: user,
    })
  } catch (error) {
    return { error: error instanceof Error ? error.message : '发表失败，请重试' }
  }

  redirect(`/p/${slug}`)
}

export async function updatePostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) return { error: '请先登录' }

  const slug = String(formData.get('slug') ?? '')
  const parsed = postInputSchema.safeParse({
    title: String(formData.get('title') ?? ''),
    tags: String(formData.get('tags') ?? ''),
    content: String(formData.get('content') ?? ''),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? '内容不合法' }

  try {
    await updatePost(
      slug,
      {
        title: parsed.data.title,
        tags: parseTags(parsed.data.tags),
        content: parsed.data.content,
        closed: formData.get('closed') === 'on',
      },
      user,
    )
  } catch (error) {
    return { error: error instanceof Error ? error.message : '保存失败，请重试' }
  }

  redirect(`/p/${slug}`)
}

export async function replyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) return { error: '请先登录' }

  const slug = String(formData.get('slug') ?? '')
  const parsed = replyInputSchema.safeParse({ content: String(formData.get('content') ?? '') })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? '回复不合法' }

  const wait = await cooldown(`reply:${user}`, 10)
  if (wait) return { error: wait }

  try {
    await createReply(slug, parsed.data.content, user)
  } catch (error) {
    return { error: error instanceof Error ? error.message : '回复失败，请重试' }
  }

  redirect(`/p/${slug}`)
}

export async function deletePostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) return { error: '请先登录' }

  try {
    await deletePost(String(formData.get('slug') ?? ''), user)
  } catch (error) {
    return { error: error instanceof Error ? error.message : '删除失败，请重试' }
  }

  redirect('/')
}