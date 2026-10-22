import rehypeShiki from '@shikijs/rehype'
import rehypeSanitize, { defaultSchema, type Options } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

const schema: Options = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // 任务列表的勾选态默认被过滤，这里放开
    input: [...(defaultSchema.attributes?.input ?? []), 'checked'],
  },
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  // 消毒必须先于高亮，高亮产出的内联样式才不会被剥掉
  .use(rehypeSanitize, schema)
  .use(rehypeSlug)
  .use(rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' } })
  .use(rehypeStringify)

// 把用户提交的 Markdown 转成可安全渲染的 HTML
export async function renderMarkdown(markdown: string): Promise<string> {
  return String(await processor.process(markdown))
}