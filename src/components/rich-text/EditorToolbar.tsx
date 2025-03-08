import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, List, ListOrdered, Indent, Outdent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FontPicker } from './FontPicker';
import { ColorPicker } from './ColorPicker';
import { useAuth } from '@/contexts/AuthContext';

interface EditorToolbarProps {
  editor: Editor | null;
  currentFont: string;
  currentColor: string;
  onFontChange: (font: string) => void;
  onColorChange: (color: string) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  currentFont,
  currentColor,
  onFontChange,
  onColorChange
}) => {
  const { role } = useAuth();
  const isDesigner = role === "designer";
  
  if (!editor) {
    return null;
  }

  const handleFontChange = (font: string) => {
    onFontChange(font);
  };

  const handleBoldClick = () => {
    if (!editor) return;
    
    if (isDesigner) {
      // For designer role: Use combined transaction approach
      // Get current color
      const { color } = editor.getAttributes('textStyle');
      const colorToPreserve = color || currentColor;
      
      // Start a single transaction
      editor.view.dispatch(editor.state.tr);
      
      // Create a transaction chain in a single update
      const chain = editor.chain().focus();
      
      // Toggle bold
      chain.toggleBold();
      
      // Immediately reapply the color in the same transaction
      if (colorToPreserve && colorToPreserve !== '#000000') {
        chain.setColor(colorToPreserve);
      }
      
      // Execute the combined chain
      chain.run();
    } else {
      // For other roles: Use the original approach
      // Get the current color before toggling bold
      const { color } = editor.getAttributes('textStyle');
      const colorToPreserve = color || currentColor;
      
      // Use a custom transaction to combine bold toggle and color preservation
      editor.view.dispatch(
        editor.state.tr
          .setMeta('addToHistory', true)
          .setMeta('preventUpdateSelection', false)
      );
      
      // Toggle bold
      editor.chain().toggleBold().run();
      
      // Reapply color in the same transaction chain
      if (colorToPreserve && colorToPreserve !== '#000000') {
        editor.chain().setColor(colorToPreserve).run();
      }
    }
  };

  const handleIndent = () => {
    if (editor) {
      if (editor.isActive('bulletList')) {
        editor.chain().focus().updateAttributes('bulletList', { 
          indent: Math.min((editor.getAttributes('bulletList').indent || 0) + 1, 10)
        }).run();
      } else if (editor.isActive('orderedList')) {
        editor.chain().focus().updateAttributes('orderedList', { 
          indent: Math.min((editor.getAttributes('orderedList').indent || 0) + 1, 10)
        }).run();
      } else {
        editor.chain().focus().updateAttributes('paragraph', { 
          indent: Math.min((editor.getAttributes('paragraph').indent || 0) + 1, 10)
        }).run();
      }
    }
  };

  const handleOutdent = () => {
    if (editor) {
      if (editor.isActive('bulletList')) {
        editor.chain().focus().updateAttributes('bulletList', { 
          indent: Math.max((editor.getAttributes('bulletList').indent || 0) - 1, 0)
        }).run();
      } else if (editor.isActive('orderedList')) {
        editor.chain().focus().updateAttributes('orderedList', { 
          indent: Math.max((editor.getAttributes('orderedList').indent || 0) - 1, 0)
        }).run();
      } else {
        editor.chain().focus().updateAttributes('paragraph', { 
          indent: Math.max((editor.getAttributes('paragraph').indent || 0) - 1, 0)
        }).run();
      }
    }
  };

  return (
    <div className="flex items-center gap-2 py-2 px-4 border-b border-editor-border bg-white">
      <FontPicker value={currentFont} onChange={handleFontChange} />
      <ColorPicker value={currentColor} onChange={onColorChange} />
      <Button
        variant="outline"
        size="sm"
        onClick={handleBoldClick}
        className={editor.isActive('bold') ? 'bg-accent' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-accent' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-accent' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-accent' : ''}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleIndent}
        title="Indent paragraph"
      >
        <Indent className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOutdent}
        title="Outdent paragraph"
      >
        <Outdent className="h-4 w-4" />
      </Button>
    </div>
  );
};
