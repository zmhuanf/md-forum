// 帖子页骨架，保持与正文相同的两栏结构
export default function Loading() {
  return (
    <div className="animate-pulse lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start lg:gap-12">
      <div className="min-w-0">
        <div className="h-3 w-40 rounded bg-surface-soft" />
        <div className="mt-6 h-8 w-3/4 rounded bg-surface-soft" />
        <div className="mt-5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-surface-soft" />
          <div className="h-3 w-32 rounded bg-surface-soft" />
        </div>

        <div className="mt-8 space-y-3">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="h-4 rounded bg-surface-soft"
              style={{ width: `${70 + ((index * 7) % 28)}%` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 hidden space-y-2 lg:block">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-3 rounded bg-surface-soft" />
        ))}
      </div>
    </div>
  )
}