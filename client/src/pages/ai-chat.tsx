import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Bot, 
  User, 
  Video, 
  Clock, 
  MapPin, 
  AlertTriangle,
  Play,
  Download,
  Search,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    cameras?: string[];
    timeRange?: string;
    videoClips?: Array<{
      id: string;
      camera: string;
      timestamp: string;
      thumbnail?: string;
      duration: number;
    }>;
    alerts?: Array<{
      id: string;
      type: string;
      camera: string;
      confidence: number;
    }>;
  };
}

const suggestions = [
  "Show me footage from Camera 01 in the last hour",
  "Were there any intrusion alerts today?",
  "What happened at the main entrance yesterday?",
  "Show me all motion detected in Zone A",
  "Search for suspicious activity between 2-4 PM",
  "How many people entered the building today?"
];

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI surveillance assistant. I can help you search through your CCTV footage, analyze security events, and answer questions about your surveillance system. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", { query });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: () => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I'm sorry, I'm having trouble accessing the surveillance system right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  });

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    chatMutation.mutate(inputValue);
    setInputValue("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Surveillance Assistant</h1>
            <p className="text-blue-100">Ask me anything about your CCTV footage and security events</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-4",
                  message.type === 'user' ? "flex-row-reverse space-x-reverse" : ""
                )}
              >
                <Avatar className={cn(
                  "w-10 h-10 shadow-lg",
                  message.type === 'user' 
                    ? "bg-gradient-to-r from-emerald-500 to-blue-600" 
                    : "bg-gradient-to-r from-purple-500 to-blue-600"
                )}>
                  <AvatarFallback className="text-white font-bold">
                    {message.type === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>

                <div className={cn(
                  "flex-1 max-w-3xl",
                  message.type === 'user' ? "text-right" : ""
                )}>
                  <div className={cn(
                    "inline-block rounded-2xl px-6 py-4 shadow-lg",
                    message.type === 'user'
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-900"
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Metadata Display */}
                  {message.metadata && (
                    <div className="mt-4 space-y-3">
                      {/* Video Clips */}
                      {message.metadata.videoClips && message.metadata.videoClips.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {message.metadata.videoClips.map((clip) => (
                            <Card key={clip.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-16 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                                    <Video className="h-6 w-6 text-slate-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-slate-900">{clip.camera}</p>
                                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                                      <span className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {clip.timestamp}
                                      </span>
                                      <span>{clip.duration}s</span>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                      <Play className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Alerts */}
                      {message.metadata.alerts && message.metadata.alerts.length > 0 && (
                        <div className="space-y-2">
                          {message.metadata.alerts.map((alert) => (
                            <Card key={alert.id} className="bg-red-50 border-red-200">
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-3">
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                  <div className="flex-1">
                                    <span className="font-medium text-red-900">{alert.type}</span>
                                    <span className="text-red-700 ml-2">at {alert.camera}</span>
                                  </div>
                                  <span className="text-sm text-red-600">{Math.round(alert.confidence * 100)}% confidence</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-4">
                <Avatar className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg">
                  <AvatarFallback className="text-white font-bold">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl px-6 py-4 shadow-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
          <p className="text-sm font-medium text-slate-700 mb-3">Try asking:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left justify-start h-auto py-3 px-4 bg-white/80 hover:bg-white border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 transition-all"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your surveillance footage..."
              className="pr-12 py-3 bg-white/90 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-slate-900 placeholder-slate-500"
              disabled={chatMutation.isPending}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || chatMutation.isPending}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}