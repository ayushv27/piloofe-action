import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/hooks/use-websocket";

interface NotificationData {
  id: string;
  type: 'alert' | 'system' | 'employee' | 'camera';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical': return 'border-l-red-500';
    case 'high': return 'border-l-orange-500';
    case 'medium': return 'border-l-yellow-500';
    case 'low': return 'border-l-blue-500';
    default: return 'border-l-gray-500';
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'alert': return '🚨';
    case 'camera': return '📹';
    case 'employee': return '👤';
    case 'system': return '⚙️';
    default: return '📢';
  }
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

export function NotificationBell() {
  const { notifications, removeNotification, clearNotifications, isConnected } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.length;
  const highPriorityCount = notifications.filter(n => 
    n.priority === 'high' || n.priority === 'critical'
  ).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 h-9 w-9"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant={highPriorityCount > 0 ? "destructive" : "default"}
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Notifications
                {!isConnected && (
                  <span className="text-xs text-red-500 ml-2">(Disconnected)</span>
                )}
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 border-l-4 hover:bg-muted/50 transition-colors relative group",
                        getPriorityColor(notification.priority)
                      )}
                    >
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                      
                      <div className="flex items-start space-x-2">
                        <span className="text-sm">{getTypeIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {notification.title}
                            </p>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge 
                              variant="secondary" 
                              className="text-xs px-1.5 py-0.5"
                            >
                              {notification.type}
                            </Badge>
                            <Badge 
                              variant={notification.priority === 'critical' || notification.priority === 'high' ? 'destructive' : 'outline'}
                              className="text-xs px-1.5 py-0.5"
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}