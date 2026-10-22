import { redirect } from 'next/navigation'
import { createPostAction } from '@/actions/posts'
import { PostForm } from '@/components/PostForm'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?next=/new')

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight">发帖</h1>
      <div className="card mt-6 p-4 sm:p-6">
        <PostForm action={createPostAction} />
      </div>
    </div>
  )
}