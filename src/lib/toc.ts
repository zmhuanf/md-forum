import GithubSlugger from 'github-slugger'
import type { Root, RootContent } from 'mdast'
import { toString } from 'mdast-util-to-string'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const parser = unified().use(remarkParse).use(remarkGfm)

export type TocItem = { id: string; text: string; level: number }

type Node = Root | RootContent

// 提取正文标题生成目录，slug 由 github-slugger 生成，与 rehype-slug 的锚点保持一致
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger()
  const items: TocItem[] = []

  const walk = (node: Node) => {
    if (node.type === 'heading') {
      const text = toString(node, { includeImageAlt: false }).trim()
      // 深层标题不进目录，但仍要占用编号，否则同名标题的后缀会和实际锚点错位
      const id = slugger.slug(text)
      if (text && node.depth <= 3) items.push({ id, text, level: node.depth })
    }
    if ('children' in node) node.children.forEach(walk)
  }

  walk(parser.parse(markdown))
  return items
}