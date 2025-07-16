
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Loader2, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { assistEventCreator } from '@/ai/flows/assist-event-creator';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from './ui/avatar';

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // Find the viewport element within the ScrollArea
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
        content: "I'm having trouble connecting right now. Please try again in a moment.",
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
          className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-br from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          <AnimatePresence>
            {isOpen ? <X className="h-6 w-6"/> : <Sparkles className="h-6 w-6"/>}
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
            <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl overflow-hidden">
              <CardHeader className="flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles /> AI Event Assistant
                </CardTitle>
                <CardDescription className="text-gray-400">How can I help you plan your event?</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden flex flex-col p-0 bg-white">
                <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 ${
                          message.role === 'user' ? 'justify-end' : ''
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8 bg-gray-700 text-white flex items-center justify-center">
                            <Bot className="h-5 w-5"/>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <ReactMarkdown className="prose prose-sm break-words prose-p:my-0">
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8 bg-gray-700 text-white flex items-center justify-center">
                            <Bot className="h-5 w-5"/>
                         </Avatar>
                         <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-gray-100 text-gray-800">
                            <div className="flex gap-1.5 items-center">
                                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t bg-white flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Ask for venues, sponsors..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      disabled={isLoading}
                      className="bg-gray-100 focus-visible:ring-orange-500"
                    />
                    <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-orange-500 hover:bg-orange-600 text-white">
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
