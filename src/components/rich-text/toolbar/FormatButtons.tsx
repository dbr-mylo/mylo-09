
import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, List, ListOrdered, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { preserveColorAfterFormatting, handleBoldWithColorPreservation } from '../utils/colorPreservation';

interface FormatButtonsProps {
  editor: Editor;
  currentColor: string;
  buttonSize: "default" | "sm" | "xs" | "xxs" | "lg" | "icon" | null | undefined;
}

export const FormatButtons: React.FC<FormatButtonsProps> = ({ 
  editor, 
  currentColor,
  buttonSize 
}) => {
  const clearFormatting = () => {
    editor.chain()
      .focus()
      .unsetAllMarks()
      .setFontFamily(null)  // Use setFontFamily(null) instead of unsetFontFamily
      .setFontSize(null)    // Use setFontSize(null) instead of unsetFontSize
      .setColor(null)      // Use setColor(null) instead of unsetColor
      .run();
  };

  return (
    <>
      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => handleBoldWithColorPreservation(editor, currentColor)}
        className={editor.isActive('bold') ? 'bg-accent' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => {
          preserveColorAfterFormatting(editor, () => {
            editor.chain().focus().toggleItalic().run();
          }, currentColor);
        }}
        className={editor.isActive('italic') ? 'bg-accent' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => preserveColorAfterFormatting(
          editor, 
          () => editor.chain().focus().toggleBulletList().run(), 
          currentColor
        )}
        className={editor.isActive('bulletList') ? 'bg-accent' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size={buttonSize}
        onClick={() => preserveColorAfterFormatting(
          editor, 
          () => editor.chain().focus().toggleOrderedList().run(), 
          currentColor
        )}
        className={editor.isActive('orderedList') ? 'bg-accent' : ''}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size={buttonSize}
        onClick={clearFormatting}
        title="Clear formatting"
      >
        <Eraser className="h-4 w-4" />
      </Button>
    </>
  );
};
