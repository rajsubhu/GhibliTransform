import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DropzoneProps {
  onImageSelect: (file: File) => void;
  className?: string;
}

export function Dropzone({ onImageSelect, className }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0]);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-all",
        isDragActive && "border-primary bg-primary/5",
        isDragReject && "border-red-500 bg-red-50",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <div className="mb-4 text-primary">
          <Upload size={48} />
        </div>
        <p className="mb-2 font-medium">Drag & drop your image here</p>
        <p className="text-sm text-gray-500 mb-4">or</p>
        <Button variant="default">Browse Files</Button>
        <p className="mt-4 text-xs text-gray-500">
          Supports JPG, PNG, WEBP (Max 5MB)
        </p>
      </div>
    </div>
  );
}
