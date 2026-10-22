import { redirect } from 'next/navigation'
import { createPostAction } from '@/actions/posts'
import { PostForm } from '@/components/PostForm'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/new')

  return (
    <div>
      <h1 className="text-xl font-semibold">发帖</h1>
      <div className="mt-6">
        <PostForm action={createPostAction} />
      </div>
    </div>
  )
}