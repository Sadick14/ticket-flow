'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Send, X, Loader2, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { assistEventCreator } from '@/ai/flows/assist-event-creator';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface AiAssistantProps {
  eventDetails: {
    name: string;
    category: string;
    location: string;
    capacity: number;
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AiAssistant({ eventDetails }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await assistEventCreator({
        query: input,
        eventDetails,
      });
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          <AnimatePresence>
            {isOpen ? <X /> : <Wand2 />}
          </AnimatePresence>
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-24 right-6 z-50"
          >
            <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Bot /> AI Event Assistant
                </CardTitle>
                <CardDescription>How can I help you plan your event?</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden flex flex-col p-0">
                <ScrollArea className="flex-grow p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 ${
                          message.role === 'user' ? 'justify-end' : ''
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot /></AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <ReactMarkdown className="prose prose-sm break-words">
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot /></AvatarFallback>
                         </Avatar>
                         <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                            <Loader2 className="h-5 w-5 animate-spin" />
                         </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Ask for venues, sponsors..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      disabled={isLoading}
                    />
                    <Button size="icon" onClick={handleSend} disabled={isLoading}>
                      <Send />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
