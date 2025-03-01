
import type { DesignPanelProps } from "@/lib/types";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useState } from "react";

export const DesignPanel = ({ content, isEditable }: DesignPanelProps) => {
  const { width } = useWindowSize();
  const isMobile = width < 1281;
  const [designContent, setDesignContent] = useState(content);
  
  // Update local content when prop changes (for when editor updates content)
  if (content !== designContent && !isEditable) {
    setDesignContent(content);
  }
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDesignContent(e.target.value);
  };
  
  return (
    <div className={`${isMobile ? 'w-full' : 'w-1/2'} p-4 md:p-8 bg-editor-panel ${!isMobile ? 'animate-slide-in' : ''} overflow-auto`}>
      <div className="mx-auto">
        {!isMobile && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-editor-text">Design Panel</h2>
            {isEditable ? (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Editable
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                View Only
              </span>
            )}
          </div>
        )}
        <div className="bg-editor-panel p-4 rounded-md">
          <div className="prose prose-sm max-w-none">
            <div 
              className="min-h-[11in] w-[8.5in] p-[1in] mx-auto bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]"
            >
              <style>
                {`
                  .prose p {
                    margin-top: 0;
                    margin-bottom: 4px;
                    line-height: 1.2;
                  }
                  .prose ul, .prose ol {
                    margin-top: 0;
                    margin-bottom: 0;
                    padding-left: 20px;
                  }
                  .prose li {
                    margin-bottom: 4px;
                    line-height: 1.2;
                  }
                  .prose li p {
                    margin: 0;
                  }
                  .prose ul ul, .prose ol ol, .prose ul ol, .prose ol ul {
                    margin-top: 4px;
                  }
                  .prose li > ul, .prose li > ol {
                    padding-left: 24px;
                  }
                `}
              </style>
              {isEditable ? (
                <textarea
                  value={designContent}
                  onChange={handleContentChange}
                  className="w-full h-full min-h-[10in] border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your content here..."
                />
              ) : content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p className="text-editor-text opacity-50">
                  Content from the editor will appear here with brand styling
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
