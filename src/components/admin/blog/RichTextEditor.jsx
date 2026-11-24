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
          'min-h-48 px-3 py-3 font-jakarta text-sm leading-6 text-ink focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-teal [&_a]:underline [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:font-abu [&_h1]:text-3xl [&_h1]:leading-tight [&_h1]:tracking-[-0.02em] [&_h1]:text-ink [&_h2]:mt-3.5 [&_h2]:mb-2 [&_h2]:font-abu [&_h2]:text-2xl [&_h2]:leading-tight [&_h2]:tracking-[-0.02em] [&_h2]:text-ink [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:font-abu [&_h3]:text-xl [&_h3]:leading-snug [&_h3]:text-ink [&_p]:my-1.5',
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
          <ToolbarButton
            label="Paragraph"
            active={editor?.isActive('paragraph') && !editor?.isActive('heading')}
            onClick={() => editor?.chain().focus().setParagraph().run()}
          >
            <span className="font-jakarta text-[11px] font-semibold lowercase">p</span>
          </ToolbarButton>
          <ToolbarButton
            label="Heading 1"
            active={editor?.isActive('heading', { level: 1 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <span className="font-jakarta text-[11px] font-semibold lowercase">h1</span>
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            active={editor?.isActive('heading', { level: 2 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <span className="font-jakarta text-[11px] font-semibold lowercase">h2</span>
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            active={editor?.isActive('heading', { level: 3 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <span className="font-jakarta text-[11px] font-semibold lowercase">h3</span>
          </ToolbarButton>
          <ToolbarButton label="Undo" onClick={() => editor?.chain().focus().undo().run()}>
            <Undo2 size={16} />
          </ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => editor?.chain().focus().redo().run()}>
            <Redo2 size={16} />
          </ToolbarButton>
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
