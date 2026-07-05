import { Spinner } from '@/components/ui/spinner';
import { extractReceiptData } from '@/features/ai/multimodal';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { UploadCloudIcon } from 'lucide-react';
import { DragEvent, useRef, useState } from 'react';
import { UseFormSetValues } from 'react-hook-form';
import { toast } from 'sonner';

export default function FileDropzoneInput({
  setValues,
  // refetch,
}: {
  setValues: UseFormSetValues<{
    amount: string;
    type: 'income' | 'expense';
    category: string;
    date: string;
    description: string;
  }>;
  // refetch: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: extractReceiptData,
    onSuccess: (response) => {
      setValues({
        ...response,
        amount: `${response.amount}`,
      });
      toast.success('Scan receipt successfully');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // refetch()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to scan receipt',
      );
    },
  });

  async function processFile(file: File) {
    if (
      !file.type.endsWith('pdf') &&
      !file.type.startsWith('image') &&
      !file.type.startsWith('video') &&
      !file.type.startsWith('audio')
    ) {
      toast.error('File type not supported');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    mutate(formData);
  }

  function handleDrop(e: DragEvent) {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer?.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
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
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf, image/*, video/*, audio/*"
        onChange={(e) => e.target.files && processFile(e.target.files[0])}
      />
      {isPending ? (
        <div className="flex flex-col gap-2 items-center">
          <Spinner className="size-8 text-primary" />
          <p className="text-xs font-medium">AI is processing...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-center">
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
      )}
    </div>
  );
}
