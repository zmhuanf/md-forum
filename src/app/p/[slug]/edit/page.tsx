import { notFound, redirect } from 'next/navigation'
import { updatePostAction } from '@/actions/posts'
import { PostForm } from '@/components/PostForm'
import { isSlug } from '@/lib/paths'
import { readPost } from '@/lib/posts'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export default async function EditPostPage({ params }: Props) {
  const { slug } = await params
  if (!isSlug(slug)) notFound()

  const user = await getCurrentUser()
  if (!user) redirect(`/login?next=/p/${slug}/edit`)

  const post = await readPost(slug)
  if (!post) notFound()
  if (post.meta.authorId !== user.id) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight">编辑帖子</h1>
      <p className="mt-1 text-xs text-muted">保存后读者会看到最新的正文与标签</p>
      <div className="card mt-6 p-4 sm:p-6">
        <PostForm
          action={updatePostAction}
          post={{ slug, title: post.meta.title, tags: post.meta.tags, content: post.content, closed: post.meta.closed }}
        />
      </div>
    </div>
  )
}