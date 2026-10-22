import Link from 'next/link'
import { registerAction } from '@/actions/auth'
import { CredentialsForm } from '@/components/CredentialsForm'
import { safeNext, usageName } from '@/lib/forms'

export const dynamic = 'force-dynamic'

export const metadata = { title: '注册' }

type Props = { searchParams: Promise<{ next?: string }> }

export default async function RegisterPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next)

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">注册</h1>
      <p className="mt-1 text-sm text-neutral-500">用户名需为{usageName}</p>
      <div className="mt-6">
        <CredentialsForm action={registerAction} mode="register" next={next} />
      </div>
      <p className="mt-4 text-sm text-neutral-500">
        已有账号？
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="hover:underline">
          去登录
        </Link>
      </p>
    </div>
  )
}