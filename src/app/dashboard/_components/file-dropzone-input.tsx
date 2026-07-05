import { cn } from '@/lib/utils';
import { UploadCloudIcon } from 'lucide-react';
import { DragEvent, useRef, useState } from 'react';
import { UseFormSetValues } from 'react-hook-form';

export default function FileDropzoneInput({
  setValues,
  refetch,
}: {
  setValues: UseFormSetValues<{
    amount: string;
    type: 'income' | 'expense';
    category: string;
    date: string;
    description: string;
  }>;
  refetch: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer?.files.length > 0) {
      console.log(e.dataTransfer.files[0]);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        'p-6 mb-4 rounded-xl border-2 border-dashed transition-all cursor-pointer',
        isDragging
          ? 'scale-[1.02] border-primary bg-primary/10'
          : 'border-muted hover:border-primary/50 hover:bg-muted/50',
      )}
    >
      <input type="file" ref={fileInputRef} className="hidden" />
      <div className="flex flex-col items-center">
        <UploadCloudIcon
          className={cn(
            'size-8',
            isDragging ? 'text-primary' : 'text-muted-foreground',
          )}
        />
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium">Drag & Drop Receipt Here</p>
          <p className="text-xs text-muted-foreground">or click to browse</p>
        </div>
      </div>
    </div>
  );
}
