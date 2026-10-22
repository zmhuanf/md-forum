'use client'

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ChangeCodeMirrorLanguage,
  codeBlockPlugin,
  codeMirrorPlugin,
  ConditionalContents,
  CreateLink,
  DiffSourceToggleWrapper,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  Separator,
  StrikeThroughSupSubToggles,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  type Translation,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

// 编辑器默认只有英文提示，这里补齐界面上会出现的文案
const text: Record<string, string> = {
  'toolbar.undo': '撤销 {{shortcut}}',
  'toolbar.redo': '重做 {{shortcut}}',
  'toolbar.bold': '加粗',
  'toolbar.removeBold': '取消加粗',
  'toolbar.italic': '斜体',
  'toolbar.removeItalic': '取消斜体',
  'toolbar.underline': '下划线',
  'toolbar.removeUnderline': '取消下划线',
  'toolbar.strikethrough': '删除线',
  'toolbar.removeStrikethrough': '取消删除线',
  'toolbar.subscript': '下标',
  'toolbar.removeSubscript': '取消下标',
  'toolbar.superscript': '上标',
  'toolbar.removeSuperscript': '取消上标',
  'toolbar.bulletedList': '无序列表',
  'toolbar.numberedList': '有序列表',
  'toolbar.checkList': '任务列表',
  'toolbar.link': '插入链接',
  'toolbar.image': '插入图片',
  'toolbar.table': '插入表格',
  'toolbar.codeBlock': '插入代码块',
  'toolbar.inlineCode': '行内代码',
  'toolbar.removeInlineCode': '取消行内代码',
  'toolbar.thematicBreak': '插入分割线',
  'toolbar.source': '源码模式',
  'toolbar.richText': '富文本模式',
  'toolbar.blockTypeSelect.placeholder': '段落',
  'toolbar.blockTypeSelect.selectBlockTypeTooltip': '切换块类型',
  'toolbar.blockTypes.paragraph': '正文',
  'toolbar.blockTypes.quote': '引用',
  'toolbar.blockTypes.heading': '标题 {{level}}',
  'contentArea.editableMarkdown': '正文内容',
  'codeBlock.language': '代码语言',
  'codeBlock.inlineLanguage': '语言',
  'codeBlock.selectLanguage': '选择代码语言',
  'createLink.text': '链接文字',
  'createLink.textTooltip': '显示给读者看的文字',
  'createLink.url': '链接地址',
  'createLink.urlPlaceholder': '粘贴或输入网址',
  'createLink.title': '悬停提示',
  'createLink.titleTooltip': '鼠标悬停时显示的提示文字',
  'createLink.saveTooltip': '保存地址',
  'createLink.cancelTooltip': '取消修改',
  'dialogControls.cancel': '取消',
  'dialogControls.save': '保存',
  'dialog.close': '关闭',
  'uploadImage.dialogTitle': '插入图片',
  'uploadImage.dialogDescriptionNoUpload': '粘贴图片地址',
  'uploadImage.dialogDescription': '粘贴图片地址',
  'uploadImage.addViaUrlInstructionsNoUpload': '图片地址：',
  'uploadImage.addViaUrlInstructions': '图片地址：',
  'uploadImage.alt': '替代文字',
  'uploadImage.title': '悬停提示',
  'uploadImage.width': '宽度',
  'uploadImage.height': '高度',
  'imageEditor.editImage': '编辑图片',
  'imageEditor.deleteImage': '删除图片',
  'linkPreview.edit': '修改链接',
  'linkPreview.remove': '删除链接',
  'linkPreview.copyToClipboard': '复制链接',
  'linkPreview.copied': '已复制',
  'table.insertRowAbove': '在上方插入行',
  'table.insertRowBelow': '在下方插入行',
  'table.insertColumnLeft': '在左侧插入列',
  'table.insertColumnRight': '在右侧插入列',
  'table.deleteRow': '删除本行',
  'table.deleteColumn': '删除本列',
  'table.deleteTable': '删除表格',
  'table.textAlignment': '文字对齐',
  'table.alignLeft': '左对齐',
  'table.alignCenter': '居中',
  'table.alignRight': '右对齐',
  'table.rowMenu': '行操作',
  'table.columnMenu': '列操作',
}

// MDXEditor 用词条 key 查文案，未覆盖的退回默认英文
const translation: Translation = (key, fallback, values) => {
  const template = text[key] ?? fallback
  return values ? template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(values[name] ?? '')) : template
}

const languages = {
  '': '纯文本',
  bash: 'Bash',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  css: 'CSS',
  go: 'Go',
  html: 'HTML',
  java: 'Java',
  js: 'JavaScript',
  json: 'JSON',
  jsx: 'JSX',
  kotlin: 'Kotlin',
  markdown: 'Markdown',
  php: 'PHP',
  python: 'Python',
  ruby: 'Ruby',
  rust: 'Rust',
  sql: 'SQL',
  swift: 'Swift',
  ts: 'TypeScript',
  tsx: 'TSX',
  yaml: 'YAML',
}

type Props = {
  markdown: string
  onChange: (markdown: string) => void
  placeholder?: string
}

export default function MarkdownEditorContent({ markdown, onChange, placeholder }: Props) {
  return (
    <MDXEditor
      markdown={markdown}
      onChange={onChange}
      placeholder={placeholder}
      translation={translation}
      className="editor-shell"
      contentEditableClassName="editor-content"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        tablePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: 'ts' }),
        codeMirrorPlugin({ codeBlockLanguages: languages }),
        markdownShortcutPlugin(),
        diffSourcePlugin(),
        toolbarPlugin({
          // 工具分成格式与插入两行，避免按钮过多撑出横向滚动条
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-1">
                  <UndoRedo />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <StrikeThroughSupSubToggles options={['Strikethrough']} />
                  <Separator />
                  <BlockTypeSelect />
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <ListsToggle />
                  <Separator />
                  <CreateLink />
                  <InsertImage />
                  <InsertTable />
                  <InsertCodeBlock />
                  {/* 代码语言选择只在光标进入代码块时才有可选的节点 */}
                  <ConditionalContents
                    options={[
                      { when: (focus) => focus?.editorType === 'codeblock', contents: () => <ChangeCodeMirrorLanguage /> },
                    ]}
                  />
                </div>
              </div>
            </DiffSourceToggleWrapper>
          ),
        }),
      ]}
    />
  )
}