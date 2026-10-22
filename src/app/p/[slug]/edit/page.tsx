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
  if (post.meta.author !== user) notFound()

  return (
    <div>
      <h1 className="text-xl font-semibold">编辑帖子</h1>
      <div className="mt-6">
        <PostForm
          action={updatePostAction}
          post={{ slug, title: post.meta.title, tags: post.meta.tags, content: post.content, closed: post.meta.closed }}
        />
      </div>
    </div>
  )
}