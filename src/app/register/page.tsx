import Link from 'next/link'
import { MessagesSquare } from 'lucide-react'
import { registerAction } from '@/actions/auth'
import { CredentialsForm } from '@/components/CredentialsForm'
import { safeNext, usageName } from '@/lib/forms'

export const dynamic = 'force-dynamic'

export const metadata = { title: '注册' }

type Props = { searchParams: Promise<{ next?: string }> }

export default async function RegisterPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next)

  return (
    <div className="mx-auto w-full max-w-sm py-4 sm:py-10">
      <div className="card p-6 sm:p-8">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-canvas">
          <MessagesSquare className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">创建账号</h1>
        <p className="mt-1.5 text-sm text-muted">用户名需为{usageName}</p>

        <div className="mt-6">
          <CredentialsForm action={registerAction} mode="register" next={next} />
        </div>
      </div>

      <p className="mt-5 text-center text-sm text-muted">
        已有账号？
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="ml-1 font-medium text-accent hover:underline"
        >
          去登录
        </Link>
      </p>
    </div>
  )
}