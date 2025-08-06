"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Bot, User, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export function MessageInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to MiniAI! I\'m here to help you build amazing applications. What would you like to create today?',
      role: 'assistant',
      timestamp: new Date(),
      status: 'delivered'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      role: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great idea! I can help you build that. Would you like me to start generating the code structure?",
        "Excellent choice! I'll create a modern, responsive application for you. Let me break down the components we'll need.",
        "Perfect! I can build that using the latest technologies. Should we include any specific features or integrations?",
        "I love that concept! Let me suggest some enhancements that would make your application even better.",
        "Great thinking! I'll design a user-friendly interface with clean, modern styling for that."
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        role: 'assistant',
        timestamp: new Date(),
        status: 'delivered'
      };

      setIsTyping(false);
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-4`}>
        <Avatar className={`w-8 h-8 ${isUser ? 'bg-purple-500' : 'bg-blue-500'}`}>
          <AvatarFallback className="text-white text-xs">
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
          <div 
            className={`
              px-4 py-2 rounded-2xl text-sm
              ${isUser 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
              }
            `}
          >
            {message.content}
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span>{format(message.timestamp, 'HH:mm')}</span>
            {message.status && isUser && (
              <div className="flex items-center gap-1">
                {message.status === 'sending' && <Clock className="w-3 h-3" />}
                {message.status === 'sent' && <CheckCircle2 className="w-3 h-3" />}
                {message.status === 'delivered' && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                {message.status === 'read' && <CheckCircle2 className="w-3 h-3 text-green-400" />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 shadow-2xl h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          AI Assistant
          <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-300 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
            Online
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 p-4 pt-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="w-8 h-8 bg-blue-500">
                  <AvatarFallback className="text-white text-xs">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-2xl">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about building your app..."
            className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400/50 focus:ring-purple-400/20"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isTyping}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center mt-2">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Powered by AI
          </p>
        </div>
      </CardContent>
    </Card>
  );
}