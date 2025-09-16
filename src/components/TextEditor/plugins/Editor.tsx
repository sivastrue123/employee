import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List as ListIcon,
  ListOrdered,
  Undo,
  Redo,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  StretchHorizontal as Justify,
} from "lucide-react";

const TButton = ({
  onClick,
  active,
  "aria-label": ariaLabel,
  children,
  disabled,
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) => (
  <Button
    type="button"
    variant={active ? "default" : "ghost"}
    size="sm"
    onClick={onClick}
    aria-label={ariaLabel}
    disabled={disabled}
    className={`h-8 px-2 ${active && "!bg-sky-500 !text-white"}`}
  >
    {children}
  </Button>
);

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: number;
};

export default function Editor({
  value,
  onChange,
  placeholder = "Write something…",
  disabled,
  className,
  minHeight = 120,
}: RichTextEditorProps) {
  const [uiVersion, setUiVersion] = useState(0);
  const bump = () => setUiVersion((v) => (v + 1) % 1000);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList.configure({ keepMarks: true, keepAttributes: false }),
      OrderedList.configure({ keepMarks: true, keepAttributes: false }),
      ListItem,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto", "tel"],
      }),
      Placeholder.configure({ placeholder }),

      // 🔑 Include listItem so alignment applies to <li> nodes too
      TextAlign.configure({
        types: ["heading", "paragraph", "listItem"],
        alignments: ["left", "center", "right", "justify"],
      }),
    ],
    editorProps: {
      attributes: {
        "data-rte": "notes",
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
        style: `min-height:${minHeight}px;`,
      },
    },
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onSelectionUpdate: bump,
    onTransaction: bump,
    onFocus: bump,
    onBlur: bump,
  });

  const toBullet = () => {
    if (!editor) return;
    const ch = editor.chain().focus();
    if (editor.isActive("bulletList")) return void ch.toggleBulletList().run();
    ch.setParagraph().toggleBulletList().run();
  };
  const toOrdered = () => {
    if (!editor) return;
    const ch = editor.chain().focus();
    if (editor.isActive("orderedList"))
      return void ch.toggleOrderedList().run();
    ch.setParagraph().toggleOrderedList().run();
  };

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", false as any);
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt("Paste link URL");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div
      data-uiversion={uiVersion}
      className={["rounded-md border bg-background", className].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-1 p-2">
        <TButton
          aria-label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          disabled={disabled}
        >
          <Bold className="h-4 w-4" />
        </TButton>
        <TButton
          aria-label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          disabled={disabled}
        >
          <Italic className="h-4 w-4" />
        </TButton>
        <TButton
          aria-label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          disabled={disabled}
        >
          <UnderlineIcon className="h-4 w-4" />
        </TButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <TButton
          aria-label="H1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          disabled={disabled}
        >
          <Heading1 className="h-4 w-4" />
        </TButton>
        <TButton
          aria-label="H2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          disabled={disabled}
        >
          <Heading2 className="h-4 w-4" />
        </TButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <TButton
          aria-label="Bullet List"
          onClick={toBullet}
          active={editor.isActive("bulletList")}
          disabled={disabled}
        >
          <ListIcon className="h-4 w-4" />
        </TButton>
        <TButton
          aria-label="Ordered List"
          onClick={toOrdered}
          active={editor.isActive("orderedList")}
          disabled={disabled}
        >
          <ListOrdered className="h-4 w-4" />
        </TButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <TButton
          aria-label="Align Left"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          disabled={disabled}
        >
          <AlignLeft className="h-4 w-4" />
        </TButton>
        <TButton
          aria-label="Align Center"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          disabled={disabled}
        >
          <AlignCenter className="h-4 w-4" />
        </TButton>
        <TButton
          aria-label="Align Right"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          disabled={disabled}
        >
          <AlignRight className="h-4 w-4" />
        </TButton>
        <TButton
          aria-label="Justify"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          disabled={disabled}
        >
          <Justify className="h-4 w-4" />
        </TButton>

        <Separator orientation="vertical" className="mx-1 h-6" />
        <TButton
          aria-label="Set/Unset Link"
          onClick={setLink}
          disabled={disabled}
        >
          <LinkIcon className="h-4 w-4" />
        </TButton>

        <div className="ml-auto flex gap-1">
          <TButton
            aria-label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo() || disabled}
          >
            <Undo className="h-4 w-4" />
          </TButton>
          <TButton
            aria-label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo() || disabled}
          >
            <Redo className="h-4 w-4" />
          </TButton>
        </div>
      </div>

      <div className="px-3 pb-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
