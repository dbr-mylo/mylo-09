
import { useRef, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { extractDimensionsFromCSS } from "@/utils/templateUtils";

interface ViewableContentProps {
  content: string;
  previewRef: React.RefObject<HTMLDivElement>;
  onClick: (e: React.MouseEvent) => void;
  templateStyles?: string;
  templateName?: string;
}

export const ViewableContent = ({ 
  content, 
  previewRef, 
  onClick,
  templateStyles = '',
  templateName = ''
}: ViewableContentProps) => {
  const { role } = useAuth();
  const { toast } = useToast();
  const isDesigner = role === "designer";
  const [prevTemplateName, setPrevTemplateName] = useState(templateName);
  
  // Extract dimensions from template styles
  const dimensions = extractDimensionsFromCSS(templateStyles);
  const width = dimensions?.width || '8.5in';
  const height = dimensions?.height || '11in';

  // Notify user when template changes
  useEffect(() => {
    if (templateName && templateName !== prevTemplateName && role === "editor") {
      toast({
        title: "Template Applied",
        description: `The "${templateName}" template has been applied to your document.`,
        duration: 3000,
      });
      setPrevTemplateName(templateName);
    }
  }, [templateName, prevTemplateName, toast, role]);

  if (isDesigner) {
    // For designer role viewing mode, don't wrap in the white div
    return (
      <>
        {templateStyles && <style dangerouslySetInnerHTML={{ __html: templateStyles }} />}
        <div 
          ref={previewRef} 
          onClick={onClick}
          dangerouslySetInnerHTML={{ __html: content }} 
          className={`cursor-pointer min-h-[${height}] w-[${width}] p-[1in] mx-auto template-styled`}
        />
      </>
    );
  } 

  // For editor role viewing mode, keep the white div with shadow
  return (
    <div className={`min-h-[${height}] w-[${width}] p-[1in] mx-auto bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),_0_1px_2px_rgba(0,0,0,0.24)]`}>
      {templateStyles && <style dangerouslySetInnerHTML={{ __html: templateStyles }} />}
      <div 
        ref={previewRef} 
        onClick={onClick}
        dangerouslySetInnerHTML={{ __html: content }} 
        className="cursor-pointer template-styled" 
      />
    </div>
  );
};
