import { toString } from 'mdast-util-to-string'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const formatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Shanghai',
})

const parser = unified().use(remarkParse).use(remarkGfm)

// 把 Markdown 解析成语法树后取纯文本，供页面 description 使用
export const excerpt = (markdown: string, length = 120) =>
  toString(parser.parse(markdown), { includeImageAlt: false, includeHtml: false })
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, length)

// 统一按东八区展示时间，避免服务器时区差异
export const formatDate = (iso: string) => {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '未知时间' : formatter.format(date)
}

const relative = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// 列表里用相对时间，超过一周的旧帖退回具体日期
// 页面是服务端渲染，取服务器当前时间即可，不参与客户端水合
export const formatRelative = (iso: string) => {
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return '未知时间'

  const diff = time - Date.now()
  if (Math.abs(diff) < MINUTE) return '刚刚'
  if (Math.abs(diff) < HOUR) return relative.format(Math.round(diff / MINUTE), 'minute')
  if (Math.abs(diff) < DAY) return relative.format(Math.round(diff / HOUR), 'hour')
  if (Math.abs(diff) < 7 * DAY) return relative.format(Math.round(diff / DAY), 'day')
  return formatDate(iso)
}