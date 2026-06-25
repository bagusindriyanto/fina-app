'use client';

import { Button } from '@/components/ui/button';
import { handleChat } from '@/features/ai/chat';
import { BotIcon } from 'lucide-react';

export default function ChatbotDrawer() {
  return (
    <div className="fixed bottom-4 right-4">
      <Button
        size="icon-lg"
        className="rounded-full"
        onClick={async () => {
          const response = await handleChat();
          console.log(response);
        }}
      >
        <BotIcon />
      </Button>
    </div>
  );
}
