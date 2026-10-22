'use client'

import { ThemeProvider as NextThemes } from 'next-themes'

// 主题以 html 上的 class 切换，globals.css 的 dark 变体依赖它
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemes>
  )
}