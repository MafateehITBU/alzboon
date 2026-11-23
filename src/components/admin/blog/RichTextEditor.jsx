'use client'

import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react'

export default function RichTextEditor({ label, value, onChange, dir = 'ltr', name }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: {
      attributes: {
        class:
          'min-h-48 px-3 py-3 font-jakarta text-sm leading-6 text-ink focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-teal [&_a]:underline',
        dir,
        lang: dir === 'rtl' ? 'ar' : 'en',
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getJSON())
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = JSON.stringify(editor.getJSON())
    const next = JSON.stringify(value || { type: 'doc', content: [{ type: 'paragraph' }] })
    if (current !== next) editor.commands.setContent(value || { type: 'doc', content: [{ type: 'paragraph' }] })
  }, [editor, value])

  function setLink() {
    if (!editor) return
    const previous = editor.getAttributes('link').href || 'https://'
    const href = window.prompt('Link URL', previous)
    if (href === null) return
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run()
  }

  return (
    <div>
      <p className="font-jakarta text-sm text-body">{label}</p>
      <div className="mt-1 overflow-hidden rounded border border-line bg-white">
        <div className="flex flex-wrap gap-1 border-b border-line/70 bg-[#f7f5ef]/70 p-2">
          <ToolbarButton label="Bold" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton label="Underline" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon size={16} />
          </ToolbarButton>
          <ToolbarButton label="Bullet list" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton label="Numbered list" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={16} />
          </ToolbarButton>
          <ToolbarButton label="Link" active={editor?.isActive('link')} onClick={setLink}>
            <Link2 size={16} />
          </ToolbarButton>
          <ToolbarButton label="Align left" active={editor?.isActive({ textAlign: 'left' })} onClick={() => editor?.chain().focus().setTextAlign('left').run()}>
            <AlignLeft size={16} />
          </ToolbarButton>
          <ToolbarButton label="Align center" active={editor?.isActive({ textAlign: 'center' })} onClick={() => editor?.chain().focus().setTextAlign('center').run()}>
            <AlignCenter size={16} />
          </ToolbarButton>
          <ToolbarButton label="Align right" active={editor?.isActive({ textAlign: 'right' })} onClick={() => editor?.chain().focus().setTextAlign('right').run()}>
            <AlignRight size={16} />
          </ToolbarButton>
          <ToolbarButton label="Undo" onClick={() => editor?.chain().focus().undo().run()}>
            <Undo2 size={16} />
          </ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => editor?.chain().focus().redo().run()}>
            <Redo2 size={16} />
          </ToolbarButton>
          <select
            aria-label="Heading level"
            className="min-h-9 rounded border border-line bg-white px-2 font-jakarta text-xs"
            value={editor?.isActive('heading', { level: 1 }) ? '1' : editor?.isActive('heading', { level: 2 }) ? '2' : editor?.isActive('heading', { level: 3 }) ? '3' : 'p'}
            onChange={(event) => {
              const value = event.target.value
              if (value === 'p') editor?.chain().focus().setParagraph().run()
              else editor?.chain().focus().toggleHeading({ level: Number(value) }).run()
            }}
          >
            <option value="p">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>
        </div>
        <EditorContent editor={editor} />
      </div>
      {name ? <input type="hidden" name={name} value={JSON.stringify(value || { type: 'doc', content: [{ type: 'paragraph' }] })} /> : null}
    </div>
  )
}

function ToolbarButton({ label, active, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex size-9 items-center justify-center rounded border ${active ? 'border-teal bg-white text-teal' : 'border-transparent text-ink hover:bg-white'}`}
    >
      {children}
    </button>
  )
}
