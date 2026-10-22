import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm text-neutral-500">404</p>
      <h1 className="mt-2 text-xl font-semibold">页面或帖子不存在</h1>
      <Link href="/" className="mt-6 inline-block text-sm hover:underline">
        返回首页
      </Link>
    </div>
  )
}