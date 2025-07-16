
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, Paperclip } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { assistEventCreator } from '@/ai/flows/assist-event-creator';
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '@/context/auth-context';
import { useAppContext } from '@/context/app-context';
import type { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


interface AiAssistantProps {
  eventDetails: {
    name: string;
    category: string;
    location: string;
    capacity: number;
  };
}

export function AiAssistant({ eventDetails }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { getChatHistory, saveChatMessage, loading: contextLoading } = useAppContext();

  useEffect(() => {
    if (isOpen && user) {
      const loadHistory = async () => {
        setIsLoading(true);
        const history = await getChatHistory(user.uid);
        setMessages(history);
        setIsLoading(false);
      };
      loadHistory();
    }
  }, [isOpen, user, getChatHistory]);


  useEffect(() => {
    if (scrollAreaRef.current) {
        // Find the viewport element within the ScrollArea
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ variant: 'destructive', title: "File too large", description: "Please upload files smaller than 5MB."});
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachments(prev => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };


  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMessageContent = input;
    const userMessage: Message = { role: 'user', content: userMessageContent, attachments };
    setMessages((prev) => [...prev, userMessage]);
    if (user) await saveChatMessage(user.uid, userMessage);
    
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      const historyForApi = messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }] // Simplified for this example
      })) as any[];

      const result = await assistEventCreator({
        prompt: userMessageContent,
        attachments,
        eventDetails,
        history: historyForApi
      });
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);
      if (user) await saveChatMessage(user.uid, assistantMessage);

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
                           {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 text-xs text-gray-400">
                              {message.attachments.length} attachment(s)
                            </div>
                           )}
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
                {attachments.length > 0 && (
                  <div className="p-2 border-t text-xs text-muted-foreground bg-gray-50">
                    Attached: {attachments.length} file(s).
                    <Button variant="link" size="sm" className="h-auto p-0 ml-2" onClick={() => setAttachments([])}>Clear</Button>
                  </div>
                )}
                <div className="p-4 border-t bg-white flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      className="hidden" 
                      accept="image/png, image/jpeg, application/pdf"
                    />
                     <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                      <Paperclip />
                    </Button>
                    <Input
                      placeholder="Ask for venues, sponsors..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      disabled={isLoading}
                      className="bg-gray-100 focus-visible:ring-orange-500"
                    />
                    <Button size="icon" onClick={handleSend} disabled={isLoading || (!input.trim() && attachments.length === 0)} className="bg-orange-500 hover:bg-orange-600 text-white">
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
