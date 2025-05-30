import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send,
  Bot,
  User,
  Video,
  Clock,
  MapPin,
  Play,
  Download,
  Camera,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  results?: SearchResult[];
}

interface SearchResult {
  id: string;
  timestamp: string;
  cameraId: number;
  cameraName: string;
  location: string;
  confidence: number;
  thumbnail: string;
  description: string;
  type: 'person' | 'vehicle' | 'object' | 'event';
  duration?: number;
  videoUrl?: string;
}

export default function Search() {
  const [currentQuery, setCurrentQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hello! I'm your CCTV AI assistant. Ask me anything about your surveillance footage - I can help you find specific people, vehicles, events, or analyze activities across your cameras.",
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: cameras = [] } = useQuery<any[]>({
    queryKey: ["/api/cameras"],
  });

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      // Call to Django backend for AI analysis
      const response = await apiRequest("POST", "/api/cctv/ask", {
        query: query,
        cameras: cameras.map((c: any) => c.id),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "assistant",
        content: data.response || "I found some relevant footage for your query.",
        timestamp: new Date(),
        results: data.results || []
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "assistant", 
        content: "I'm having trouble analyzing the footage right now. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      
      toast({
        title: "Search Error",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!currentQuery.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentQuery,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Send to Django backend
    searchMutation.mutate(currentQuery);
    setCurrentQuery("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Camera className="h-8 w-8 mr-3" />
          Ask My CCTV
        </h1>
        <p className="text-muted-foreground">
          Ask questions about your surveillance footage in natural language
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <MessageSquare className="h-5 w-5 mr-2" />
                Conversation
              </CardTitle>
              <CardDescription>
                Ask questions like "Show me when someone entered at 3 PM" or "Find all vehicles from today"
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.type === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>

                        {/* Show results if available */}
                        {message.results && message.results.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.results.map((result) => (
                              <div
                                key={result.id}
                                className="bg-white border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                    <Play className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {result.cameraName}
                                      </h4>
                                      <Badge variant="outline" className="text-xs">
                                        {Math.round(result.confidence * 100)}%
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {result.description}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-400 mt-1 space-x-3">
                                      <span className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {new Date(result.timestamp).toLocaleString()}
                                      </span>
                                      <span className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {result.location}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {message.type === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input Area */}
              <div className="mt-4 flex space-x-2">
                <Input
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  placeholder="Ask about your CCTV footage..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!currentQuery.trim() || isTyping}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="h-5 w-5 mr-2" />
                Example Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">People Detection</h4>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-auto p-2"
                    onClick={() => setCurrentQuery("Show me all people who entered today")}
                  >
                    "Show me all people who entered today"
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-auto p-2"
                    onClick={() => setCurrentQuery("Find person wearing red jacket")}
                  >
                    "Find person wearing red jacket"
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Vehicle Tracking</h4>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-auto p-2"
                    onClick={() => setCurrentQuery("Show all delivery trucks from this week")}
                  >
                    "Show all delivery trucks from this week"
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-auto p-2"
                    onClick={() => setCurrentQuery("Find white car in parking lot")}
                  >
                    "Find white car in parking lot"
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Activity Analysis</h4>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-auto p-2"
                    onClick={() => setCurrentQuery("What happened at 3 PM yesterday?")}
                  >
                    "What happened at 3 PM yesterday?"
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-auto p-2"
                    onClick={() => setCurrentQuery("Show suspicious activities after hours")}
                  >
                    "Show suspicious activities after hours"
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500">
                  <p className="font-medium mb-1">Connected Cameras</p>
                  <p>{cameras.length} active cameras</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}