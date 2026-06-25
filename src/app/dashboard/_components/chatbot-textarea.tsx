import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { zodResolver } from '@hookform/resolvers/zod';
import { SendIcon } from 'lucide-react';
import { KeyboardEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

const formSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export default function ChatbotTextarea({
  sendMessage,
  isPending,
}: {
  sendMessage: (message: string) => void;
  isPending: boolean;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage(data.message);
    form.reset();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isPending) onSubmit(form.getValues());
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col p-2 rounded-2xl bg-secondary"
    >
      <Controller
        control={form.control}
        name="message"
        render={({ field, fieldState }) => (
          <Field>
            <textarea
              {...field}
              id="chatbot-message"
              placeholder="Ask AI Advisor here"
              autoComplete="off"
              className="px-3 py-2 h-16 rounded-md resize-none focus:outline-none"
              onKeyDown={handleKeyDown}
            />
          </Field>
        )}
      />
      <div className="flex justify-between">
        <div></div>
        <div>
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="text-primary hover:bg-primary/10 hover:text-primary disabled:bg-transparent"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : <SendIcon />}
          </Button>
        </div>
      </div>
    </form>
  );
}
