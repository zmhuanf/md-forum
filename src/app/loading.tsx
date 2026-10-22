// 路由切换时的通用骨架，避免白屏
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-64 rounded-3xl border border-line bg-surface/60" />

      <div className="mt-8 flex flex-wrap gap-1.5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-6 w-16 rounded-full bg-surface-soft" />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 rounded-2xl border border-line bg-surface/60" />
        ))}
      </div>
    </div>
  )
}