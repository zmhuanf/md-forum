import clsx from 'clsx'

// 用用户名算出固定色位，同一个人在列表、帖子、回复里的头像颜色一致
const hash = (name: string) =>
  [...name].reduce((sum, char) => (sum * 31 + (char.codePointAt(0) ?? 0)) % 9973, 7)

// 低饱和纯色，避免彩色渐变抢走正文的注意力
const palettes = [
  'bg-[#5f6b7a]',
  'bg-[#726150]',
  'bg-[#54695a]',
  'bg-[#6b5a70]',
  'bg-[#4f6472]',
  'bg-[#7a5c50]',
  'bg-[#5a5a54]',
  'bg-[#6f5560]',
]

const sizes = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-16 w-16 text-2xl',
}

type Props = {
  name: string
  size?: keyof typeof sizes
  className?: string
}

// 用户名首字生成的纯色圆形头像
export function Avatar({ name, size = 'sm', className }: Props) {
  return (
    <span
      aria-hidden
      className={clsx(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white ring-1 ring-black/5 dark:ring-white/10',
        palettes[hash(name) % palettes.length],
        sizes[size],
        className,
      )}
    >
      {[...name][0]?.toUpperCase() ?? '?'}
    </span>
  )
}