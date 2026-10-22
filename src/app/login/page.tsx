import Link from 'next/link'
import { loginAction } from '@/actions/auth'
import { CredentialsForm } from '@/components/CredentialsForm'
import { safeNext } from '@/lib/forms'

export const dynamic = 'force-dynamic'

export const metadata = { title: '登录' }

type Props = { searchParams: Promise<{ next?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next)

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">登录</h1>
      <div className="mt-6">
        <CredentialsForm action={loginAction} mode="login" next={next} />
      </div>
      <p className="mt-4 text-sm text-neutral-500">
        还没有账号？
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="hover:underline">
          去注册
        </Link>
      </p>
    </div>
  )
}