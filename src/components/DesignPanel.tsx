
import type { DesignPanelProps } from "@/lib/types";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentPreview } from "@/components/design/DocumentPreview";
import { textStyleStore } from "@/stores/textStyleStore";
import { useToast } from "@/hooks/use-toast";
import { DesignerSidebar } from "@/components/design/DesignerSidebar";
import { ToolSettingsMenuBar } from "@/components/design/ToolSettingsMenuBar";
import { EditorToolbar } from "@/components/rich-text/EditorToolbar";
import { useEditorSetup } from "@/components/rich-text/useEditor";
import { getPreviewVisibilityPreference, setPreviewVisibilityPreference } from "@/components/editor-nav/EditorNavUtils";

export const DesignPanel = ({ content, isEditable }: DesignPanelProps) => {
  const { width } = useWindowSize();
  const { role } = useAuth();
  const { toast } = useToast();
  const isMobile = width < 1281;
  const isStandalone = role === "designer";
  const [designContent, setDesignContent] = useState(content);
  const [customStyles, setCustomStyles] = useState<string>("");
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  
  // Add state for preview visibility
  const [isPreviewVisible, setIsPreviewVisible] = useState(() => {
    if (isStandalone) {
      return getPreviewVisibilityPreference();
    }
    return true;
  });
  
  // Save preference to localStorage when it changes
  useEffect(() => {
    if (isStandalone) {
      setPreviewVisibilityPreference(isPreviewVisible);
    }
  }, [isPreviewVisible, isStandalone]);
  
  if (content !== designContent && !isEditable) {
    setDesignContent(content);
  }
  
  const handleContentChange = (newContent: string) => {
    setDesignContent(newContent);
  };
  
  const handleStylesChange = (styles: string) => {
    setCustomStyles(styles);
  };

  const handleElementSelect = (element: HTMLElement | null) => {
    setSelectedElement(element);
  };
  
  const handleStyleChange = (styles: Record<string, string>) => {
    if (!selectedElement) return;
    
    Object.entries(styles).forEach(([property, value]) => {
      selectedElement.style[property as any] = value;
    });
  };

  const handleSaveStyle = async (styleData: any) => {
    try {
      await textStyleStore.saveTextStyle(styleData);
      
      const styles = await textStyleStore.getTextStyles();
      const css = textStyleStore.generateCSSFromTextStyles(styles);
      setCustomStyles(css);
      
      toast({
        title: "Style saved",
        description: "Text style has been saved to your collection.",
      });
    } catch (error) {
      console.error("Error saving text style:", error);
      toast({
        title: "Error saving style",
        description: "There was a problem saving your text style.",
        variant: "destructive",
      });
    }
  };
  
  // Toggle preview visibility
  const handleTogglePreview = () => {
    setIsPreviewVisible(prev => !prev);
  };
  
  // For designer role, create editor setup to get toolbar props
  const editorSetup = isEditable && isStandalone ? 
    useEditorSetup({ 
      content: designContent, 
      onUpdate: handleContentChange, 
      isEditable 
    }) : null;
  
  const renderToolbar = () => {
    if (!editorSetup || !editorSetup.editor) return null;
    
    return (
      <EditorToolbar 
        editor={editorSetup.editor}
        currentFont={editorSetup.currentFont}
        currentColor={editorSetup.currentColor}
        onFontChange={editorSetup.handleFontChange}
        onColorChange={editorSetup.handleColorChange}
      />
    );
  };

  // Sample preview content for preview view
  const previewContent = `
    <h1>Preview of Your Document</h1>
    <p>This is a preview of how your document will look with the current styling. The content shown here is for demonstration purposes only.</p>
    <h2>Section Heading</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.</p>
    <ul>
      <li>First item in a list</li>
      <li>Second item in a list</li>
      <li>Third item with some additional text to show wrapping behavior</li>
    </ul>
    <h3>Subsection Example</h3>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae.</p>
    <blockquote>This is an example of a blockquote that might appear in your document.</blockquote>
  `;
  
  if (isStandalone) {
    return (
      <div className="w-full flex flex-row">
        {/* Top menu bar that spans across the editor and preview panels */}
        {isEditable && (
          <div className="absolute top-0 left-0 right-64 z-10">
            <ToolSettingsMenuBar 
              toolbar={isEditable ? renderToolbar() : undefined} 
              isPreviewVisible={isPreviewVisible}
              onTogglePreview={handleTogglePreview}
            />
          </div>
        )}
        
        <div className="flex flex-1">
          {/* Editor view - always visible */}
          <div className={isPreviewVisible ? "w-1/2 bg-editor-panel overflow-auto border-r border-editor-border" : "w-full bg-editor-panel overflow-auto"}>
            {/* Add padding-top to account for the toolbar */}
            <div className={`p-4 md:p-8 ${isEditable ? "pt-14" : ""}`}>
              <div className="mx-auto">
                <DocumentPreview 
                  content={designContent}
                  customStyles={customStyles}
                  isEditable={isEditable}
                  onContentChange={handleContentChange}
                  onElementSelect={handleElementSelect}
                  renderToolbarOutside={isEditable}
                />
              </div>
            </div>
          </div>
          
          {/* Preview panel - only visible when isPreviewVisible is true */}
          {isPreviewVisible && (
            <div className="w-1/2 bg-white overflow-auto">
              {/* Add padding-top to account for the toolbar */}
              <div className={`p-4 md:p-8 ${isEditable ? "pt-14" : ""}`}>
                <div className="mb-3">
                  <h3 className="text-base font-medium text-editor-heading mb-2">Document Preview</h3>
                  <div 
                    dangerouslySetInnerHTML={{ __html: previewContent }} 
                    className="p-4 bg-gray-50 border border-gray-200 rounded-md prose prose-sm max-w-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar - always on the right */}
        <DesignerSidebar />
      </div>
    );
  }
  
  return (
    <div className={`${isStandalone ? 'w-full' : isMobile ? 'w-full' : 'w-1/2'} bg-editor-panel ${!isMobile ? 'animate-slide-in' : ''} overflow-auto`}>
      {isEditable && (
        <div className="w-full">
          <ToolSettingsMenuBar />
        </div>
      )}
      <div className="p-4 md:p-8">
        <div className="mx-auto">
          <DocumentPreview 
            content={designContent}
            customStyles={customStyles}
            isEditable={isEditable}
            onContentChange={handleContentChange}
            onElementSelect={handleElementSelect}
          />
        </div>
      </div>
    </div>
  );
};
