import Link from 'next/link'
import { MessagesSquare } from 'lucide-react'
import { loginAction } from '@/actions/auth'
import { CredentialsForm } from '@/components/CredentialsForm'
import { safeNext } from '@/lib/forms'

export const dynamic = 'force-dynamic'

export const metadata = { title: '登录' }

type Props = { searchParams: Promise<{ next?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next)

  return (
    <div className="mx-auto w-full max-w-sm py-4 sm:py-10">
      <div className="card p-6 sm:p-8">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-canvas">
          <MessagesSquare className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">欢迎回来</h1>
        <p className="mt-1.5 text-sm text-muted">登录后继续发帖与回复</p>

        <div className="mt-6">
          <CredentialsForm action={loginAction} mode="login" next={next} />
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-muted">
        还没有账号？
        <Link
          href={`/register?next=${encodeURIComponent(next)}`}
          className="ml-1 font-medium text-accent hover:underline"
        >
          去注册
        </Link>
      </p>
    </div>
  )
}