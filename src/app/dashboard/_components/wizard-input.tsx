'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { handleWizardInput, handleWizardTools } from '@/features/ai/wizard';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { MicIcon, SendIcon, SparkleIcon, SquareIcon } from 'lucide-react';
import { KeyboardEvent, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Markdown from 'react-markdown';
import { toast } from 'sonner';
import z from 'zod';

const formSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export default function WizardInput({ refetch }: { refetch: () => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: handleWizardTools,
    onSuccess: (response) => {
      toast.success(
        <div className="response-ai w-full!">
          <Markdown>{response}</Markdown>
        </div>,
      );
      refetch();
      form.reset();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to process your request',
      );
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append('type', 'text');
    formData.append('file', '');
    formData.append('request', data.message);
    mutate(formData);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isPending) onSubmit(form.getValues());
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('type', 'audio');
        formData.append('file', audioBlob);
        formData.append('request', '');
        mutate(formData);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Failed to access media recorder');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  const isText = form.watch('message') !== '';

  return (
    <Card className="p-0 w-full border-primary/20">
      <CardContent className="px-4">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-2 items-center"
        >
          <div className="text-primary">
            <SparkleIcon className="size-5" />
          </div>
          <Controller
            control={form.control}
            name="message"
            render={({ field }) => (
              <Field>
                <input
                  {...field}
                  id="chatbot-message"
                  placeholder={
                    isRecording
                      ? 'Listening...'
                      : isPending && !field.value
                        ? 'Processing your request...'
                        : 'Ask AI Advisor here'
                  }
                  autoComplete="off"
                  className="h-14 focus:outline-none"
                  onKeyDown={handleKeyDown}
                  disabled={isPending || isRecording}
                />
              </Field>
            )}
          />
          <Button
            type={isText ? 'submit' : 'button'}
            size="icon"
            variant="ghost"
            disabled={isPending}
            onClick={
              !isText
                ? isRecording
                  ? stopRecording
                  : startRecording
                : undefined
            }
          >
            {isPending ? (
              <Spinner />
            ) : isText ? (
              <SendIcon />
            ) : isRecording ? (
              <SquareIcon className="animate-pulse text-destructive fill-destructive" />
            ) : (
              <MicIcon />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
