'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { handleChat } from '@/features/ai/chat';
import { cn } from '@/lib/utils';
import { BotIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import ChatbotTextarea from './chatbot-textarea';

export default function ChatbotDrawer() {
  const [conversation, setConversation] = useState<
    {
      role: string;
      parts: {
        text: string;
      }[];
    }[]
  >([
    { role: 'user', parts: [{ text: 'Hello' }] },
    { role: 'model', parts: [{ text: 'Hello, how can i help you?' }] },
  ]);

  return (
    <Drawer direction="right" modal={false}>
      <DrawerTrigger className="fixed right-4 bottom-4" asChild>
        <Button
          size="icon-lg"
          className="rounded-full"
          // onClick={async () => {
          //   const response = await handleChat();
          //   console.log(response);
          // }}
        >
          <BotIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className='w-screen! md:w-110!"'>
        <DrawerHeader className="flex flex-row justify-between">
          <div>
            <DrawerTitle className="font-bold text-primary">
              AI Financial Advisor
            </DrawerTitle>
            <DrawerDescription>
              Get personalized financial advice.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="outline" size="icon">
              <XIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 h-full no-scrollbar">
          {conversation.length > 0 ? (
            <div className="flex overflow-y-auto overflow-x-hidden flex-col gap-8 h-full no-scrollbar">
              {conversation.map((message, index) => (
                <div
                  key={`conversation-${index}`}
                  className={cn(
                    'flex flex-col gap-2',
                    message.role === 'model' ? 'items-start' : 'items-end',
                  )}
                >
                  <div
                    className={cn('flex flex-col w-full', {
                      'bg-primary/20 text-primary px-5 py-2 rounded-2xl rounded-br-md w-fit max-w-3/4':
                        message.role === 'user',
                    })}
                  >
                    {message.role === 'model' && (
                      <div className="flex gap-1 items-center text-xs font-semibold text-primary">
                        <BotIcon />
                        AI Advisor
                      </div>
                    )}
                    {message.parts[0].text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full">
              <h2 className="text-3xl font-bold text-primary">Hello There</h2>
              <h4 className="text-xl text-muted-foreground">
                What can I help you?
              </h4>
            </div>
          )}
        </div>
        <DrawerFooter>
          <ChatbotTextarea />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
