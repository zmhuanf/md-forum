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