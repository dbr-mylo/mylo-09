
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface EditorContainerProps {
  children: React.ReactNode;
  fixedToolbar?: boolean;
  refProp?: React.RefObject<HTMLDivElement>;
  templateStyles?: string;
}

export const EditorContainer: React.FC<EditorContainerProps> = ({ 
  children, 
  fixedToolbar = false,
  refProp,
  templateStyles = ''
}) => {
  const { role } = useAuth();
  const isDesigner = role === "designer";

  return (
    <div 
      className={`prose prose-sm max-w-none font-editor ${isDesigner ? 'designer-editor' : ''}`}
      ref={refProp}
    >
      <style>
        {`
        .designer-editor .ProseMirror {
          min-height: 11in;
          width: 8.5in;
          margin: 0 auto;
          background-color: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        }
        
        /* Default page size for all editor roles if no template styles */
        .ProseMirror {
          min-height: 11in;
          width: 8.5in;
          margin: 0 auto;
          background-color: white;
        }
        
        .editor-toolbar {
          background-color: white;
          ${!isDesigner ? 'border-bottom: 1px solid #e2e8f0;' : ''}
          padding: 0;
          margin: 0;
          z-index: 10;
        }
        
        .fixed-toolbar {
          position: sticky;
          top: 0;
          z-index: 10;
          width: 100%;
        }

        /* Apply custom template styles if available */
        ${templateStyles}
        `}
      </style>
      {children}
    </div>
  );
};
