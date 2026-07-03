import { Field } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { BrainIcon, SendIcon } from 'lucide-react';
import { Dispatch, KeyboardEvent, SetStateAction } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

const modeItems = [
  { label: 'General', value: 'general' },
  { label: 'Personal', value: 'personal' },
];

const formSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export default function ChatbotTextarea({
  sendMessage,
  isThinking,
  setIsThinking,
  isPending,
  mode,
  setMode,
}: {
  sendMessage: (message: string) => void;
  isThinking: boolean;
  setIsThinking: Dispatch<SetStateAction<boolean>>;
  isPending: boolean;
  mode: 'general' | 'personal';
  setMode: Dispatch<SetStateAction<'general' | 'personal'>>;
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
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        control={form.control}
        name="message"
        render={({ field }) => (
          <Field>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id="chatbot-message"
                placeholder="Ask AI Advisor here"
                autoComplete="off"
                className="h-16 focus:outline-none"
                onKeyDown={handleKeyDown}
              />
              <InputGroupAddon align="block-end">
                <InputGroupButton
                  size="icon-sm"
                  variant={isThinking ? 'default' : 'ghost'}
                  onClick={() => setIsThinking(!isThinking)}
                >
                  <BrainIcon />
                </InputGroupButton>
                <Select
                  items={modeItems}
                  value={mode}
                  onValueChange={(value: 'general' | 'personal') =>
                    setMode(value)
                  }
                >
                  <SelectTrigger className="bg-background shadow-xs" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {modeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <InputGroupButton
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto text-primary hover:bg-primary/10 hover:text-primary"
                  disabled={isPending}
                >
                  {isPending ? <Spinner /> : <SendIcon />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        )}
      />
    </form>
  );
}
