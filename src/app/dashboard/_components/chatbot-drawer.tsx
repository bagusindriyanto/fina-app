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
import { handleChat, handleChatStreaming } from '@/features/ai/chat';
import { cn } from '@/lib/utils';
import { BotIcon, ChevronDownIcon, EllipsisIcon, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ChatbotTextarea from './chatbot-textarea';
import { useMutation } from '@tanstack/react-query';
import Markdown from 'react-markdown';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Conversation } from '@/app/types/ai';

export default function ChatbotDrawer() {
  const chatRef = useRef<HTMLDivElement>(null);
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // const { mutate: handleChatMutation, isPending } = useMutation({
  //   mutationFn: ({
  //     isThinking,
  //   }: {
  //     isThinking: boolean;
  //   }) => handleChat(conversation, isThinking),
  //   onSuccess: (response) => {
  //     let parts: {
  //       text: string;
  //       thought?: boolean;
  //     }[] = [];

  //     if (response?.thought !== '') {
  //       parts = [
  //         ...parts,
  //         { thought: true, text: response?.thought || 'Terjadi kesalahan' },
  //       ];
  //     }
  //     const botMessage: Conversation = {
  //       role: 'model',
  //       parts: [...parts, { text: response?.answer || 'Terjadi kesalahan' }],
  //     };
  //     setConversation((prev) => [...prev, botMessage]);
  //   },
  //   onError: (error) => {
  //     const botMessage: Conversation = {
  //       role: 'model',
  //       parts: [{ text: 'Terjadi kesalahan: ' + error.message }],
  //     };
  //     setConversation((prev) => [...prev, botMessage]);
  //   },
  // });

  const { mutate: handleChatMutation, isPending } = useMutation({
    mutationFn: async ({ isThinking }: { isThinking: boolean }) => {
      if (isThinking) {
        setConversation((prev) => [
          ...prev,
          { role: 'model', parts: [{ thought: true, text: '' }, { text: '' }] },
        ]);

        const response = await handleChatStreaming(
          conversation,
          isThinking,
          'personal',
        );

        for await (const chunk of response) {
          setConversation((prev) => {
            const newConversation = [...prev];
            const lastIndex = newConversation.length - 1;

            const parts = newConversation[lastIndex].parts;

            newConversation[lastIndex] = {
              ...newConversation[lastIndex],
              parts: [
                {
                  ...parts[0],
                  text: chunk.startsWith('[thought]')
                    ? parts[0].text + chunk.replace('[thought]', '')
                    : parts[0].text,
                },
                {
                  text: !chunk.startsWith('[thought]')
                    ? parts[1].text + chunk
                    : parts[1].text,
                },
              ],
            };
            return newConversation;
          });
        }
        return response;
      } else {
        setConversation((prev) => [
          ...prev,
          { role: 'model', parts: [{ text: '' }] },
        ]);

        const response = await handleChatStreaming(
          conversation,
          isThinking,
          'personal',
        );

        for await (const chunk of response) {
          setConversation((prev) => {
            const newConversation = [...prev];
            const lastIndex = newConversation.length - 1;

            newConversation[lastIndex] = {
              ...newConversation[lastIndex],
              parts: [
                { text: newConversation[lastIndex].parts[0].text + chunk },
              ],
            };
            return newConversation;
          });
        }
        return response;
      }
    },
    onError: (error) => {
      const botMessage: Conversation = {
        role: 'model',
        parts: [{ text: 'Terjadi kesalahan: ' + error.message }],
      };
      setConversation((prev) => [...prev, botMessage]);
    },
  });

  function sendMessage(message: string) {
    const newMessage: Conversation = {
      role: 'user',
      parts: [{ text: message }],
    };
    setConversation((prev) => [...prev, newMessage]);
    handleChatMutation({ isThinking });
  }

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current?.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [conversation]);

  return (
    <Drawer direction="right" modal={false}>
      <DrawerTrigger className="fixed right-4 bottom-4" asChild>
        <Button size="icon-lg" className="rounded-full">
          <BotIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-screen! md:w-110!">
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
            <div
              ref={chatRef}
              className="flex overflow-y-auto overflow-x-hidden flex-col gap-8 h-full no-scrollbar"
            >
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
                    {message.role === 'model' ? (
                      <div className="response-ai">
                        {message.parts.map((part, indexPart) => (
                          <div key={`response-ai-${index}-${indexPart}`}>
                            {part.thought ? (
                              <Collapsible>
                                <CollapsibleTrigger
                                  render={<Button variant="ghost" size="sm" />}
                                >
                                  Tampilkan alur berpikir
                                  <ChevronDownIcon />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="pl-2 ml-4 border-l">
                                    <Markdown>{part.text}</Markdown>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ) : (
                              <Markdown>{part.text}</Markdown>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      message.parts[0].text
                    )}
                  </div>
                </div>
              ))}
              {isPending && (
                <div className="flex items-center animate-pulse">
                  <EllipsisIcon className="size-8 text-primary/50" />
                </div>
              )}
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
          <ChatbotTextarea
            isThinking={isThinking}
            setIsThinking={setIsThinking}
            isPending={isPending}
            sendMessage={sendMessage}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
